package com.ecommerce.service;

import com.ecommerce.entity.NotificationPreferences;
import com.ecommerce.entity.Order;
import com.ecommerce.entity.OrderStatus;
import com.ecommerce.entity.User;
import com.ecommerce.repository.NotificationPreferencesRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class NotificationService {
    
    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);
    private static final String EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
    
    @Autowired
    private NotificationPreferencesRepository notificationPreferencesRepository;
    
    @Autowired
    private RestTemplate restTemplate;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @Autowired
    private WebSocketNotificationService webSocketNotificationService;
    
    /**
     * Send order status change notification to customer
     */
    public void sendOrderStatusNotification(Order order, OrderStatus oldStatus, OrderStatus newStatus) {
        try {
            // Check if user has enabled order update notifications
            if (!shouldSendOrderNotification(order.getUser())) {
                logger.info("Order notifications disabled for user {}", order.getUser().getId());
                return;
            }
            
            String title = "Order Update";
            String message = buildStatusChangeMessage(order, oldStatus, newStatus);
            
            Map<String, Object> data = new HashMap<>();
            data.put("orderId", order.getId().toString());
            data.put("status", newStatus.toString());
            data.put("type", "ORDER_STATUS_UPDATE");
            
            sendPushNotification(order.getUser(), title, message, data);
            
            // Also send real-time WebSocket notification
            webSocketNotificationService.sendOrderStatusUpdate(order, oldStatus, newStatus);
            
        } catch (Exception e) {
            logger.error("Failed to send order status notification for order {}: {}", 
                    order.getId(), e.getMessage(), e);
        }
    }
    
    /**
     * Send order creation notification to customer
     */
    public void sendOrderCreatedNotification(Order order) {
        try {
            if (!shouldSendOrderNotification(order.getUser())) {
                logger.info("Order notifications disabled for user {}", order.getUser().getId());
                return;
            }
            
            String title = "Order Confirmed";
            String message = String.format(
                    "Your order #%s has been created successfully. Total amount: %s VND.",
                    order.getId().toString().substring(0, 8).toUpperCase(),
                    order.getTotalAmount()
            );
            
            Map<String, Object> data = new HashMap<>();
            data.put("orderId", order.getId().toString());
            data.put("status", order.getStatus().toString());
            data.put("type", "ORDER_CREATED");
            
            sendPushNotification(order.getUser(), title, message, data);
            
            // Also send real-time notification to admins about new order
            webSocketNotificationService.sendNewOrderNotificationToAdmin(order);
            
        } catch (Exception e) {
            logger.error("Failed to send order creation notification for order {}: {}", 
                    order.getId(), e.getMessage(), e);
        }
    }
    
    /**
     * Send order cancellation notification to customer
     */
    public void sendOrderCancelledNotification(Order order) {
        try {
            if (!shouldSendOrderNotification(order.getUser())) {
                logger.info("Order notifications disabled for user {}", order.getUser().getId());
                return;
            }
            
            String title = "Order Cancelled";
            String message = String.format(
                    "Your order #%s has been cancelled. The amount %s VND will be refunded if payment was made.",
                    order.getId().toString().substring(0, 8).toUpperCase(),
                    order.getTotalAmount()
            );
            
            Map<String, Object> data = new HashMap<>();
            data.put("orderId", order.getId().toString());
            data.put("status", "CANCELED");
            data.put("type", "ORDER_CANCELLED");
            
            sendPushNotification(order.getUser(), title, message, data);
            
        } catch (Exception e) {
            logger.error("Failed to send order cancellation notification for order {}: {}", 
                    order.getId(), e.getMessage(), e);
        }
    }
    
    /**
     * Send delivery notification to customer
     */
    public void sendDeliveryNotification(Order order) {
        try {
            if (!shouldSendDeliveryNotification(order.getUser())) {
                logger.info("Delivery notifications disabled for user {}", order.getUser().getId());
                return;
            }
            
            String title = "Order Delivered";
            String message = String.format(
                    "Your order #%s has been delivered successfully. Thank you for shopping with us!",
                    order.getId().toString().substring(0, 8).toUpperCase()
            );
            
            Map<String, Object> data = new HashMap<>();
            data.put("orderId", order.getId().toString());
            data.put("status", "COMPLETED");
            data.put("type", "ORDER_DELIVERED");
            
            sendPushNotification(order.getUser(), title, message, data);
            
        } catch (Exception e) {
            logger.error("Failed to send delivery notification for order {}: {}", 
                    order.getId(), e.getMessage(), e);
        }
    }
    
    /**
     * Send push notification to user
     */
    private void sendPushNotification(User user, String title, String body, Map<String, Object> data) {
        if (user.getPushToken() == null || user.getPushToken().trim().isEmpty()) {
            logger.info("No push token found for user {}", user.getId());
            return;
        }
        
        try {
            Map<String, Object> notification = new HashMap<>();
            notification.put("to", user.getPushToken());
            notification.put("title", title);
            notification.put("body", body);
            notification.put("data", data);
            notification.put("sound", "default");
            notification.put("badge", 1);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Accept", "application/json");
            headers.set("Accept-Encoding", "gzip, deflate");
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(notification, headers);
            
            ResponseEntity<String> response = restTemplate.postForEntity(EXPO_PUSH_URL, request, String.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                logger.info("Push notification sent successfully to user {}: {}", user.getId(), title);
            } else {
                logger.warn("Failed to send push notification to user {}: HTTP {}", 
                        user.getId(), response.getStatusCode());
            }
            
        } catch (Exception e) {
            logger.error("Error sending push notification to user {}: {}", user.getId(), e.getMessage(), e);
        }
    }
    
    /**
     * Check if user has enabled order notifications
     */
    private boolean shouldSendOrderNotification(User user) {
        return notificationPreferencesRepository.findByUser(user)
                .map(NotificationPreferences::getOrderUpdates)
                .orElse(true); // Default to enabled if no preferences found
    }
    
    /**
     * Check if user has enabled delivery notifications
     */
    private boolean shouldSendDeliveryNotification(User user) {
        return notificationPreferencesRepository.findByUser(user)
                .map(NotificationPreferences::getDeliveryNotifications)
                .orElse(true); // Default to enabled if no preferences found
    }
    
    /**
     * Update user's push token
     */
    public void updatePushToken(User user, String pushToken) {
        try {
            user.setPushToken(pushToken);
            logger.info("Updated push token for user {}", user.getId());
        } catch (Exception e) {
            logger.error("Failed to update push token for user {}: {}", user.getId(), e.getMessage(), e);
        }
    }
    
    /**
     * Get or create notification preferences for user
     */
    public NotificationPreferences getOrCreateNotificationPreferences(User user) {
        return notificationPreferencesRepository.findByUser(user)
                .orElseGet(() -> {
                    NotificationPreferences preferences = new NotificationPreferences(user);
                    return notificationPreferencesRepository.save(preferences);
                });
    }
    
    /**
     * Update notification preferences for user
     */
    public NotificationPreferences updateNotificationPreferences(User user, 
            Boolean orderUpdates, Boolean promotions, Boolean deliveryNotifications, Boolean paymentNotifications) {
        NotificationPreferences preferences = getOrCreateNotificationPreferences(user);
        
        if (orderUpdates != null) preferences.setOrderUpdates(orderUpdates);
        if (promotions != null) preferences.setPromotions(promotions);
        if (deliveryNotifications != null) preferences.setDeliveryNotifications(deliveryNotifications);
        if (paymentNotifications != null) preferences.setPaymentNotifications(paymentNotifications);
        
        return notificationPreferencesRepository.save(preferences);
    }
    
    private String buildStatusChangeMessage(Order order, OrderStatus oldStatus, OrderStatus newStatus) {
        String orderId = order.getId().toString().substring(0, 8).toUpperCase();
        
        switch (newStatus) {
            case CONFIRMED:
                return String.format("Your order #%s has been confirmed and is being prepared for shipment.", orderId);
            case SHIPPED:
                return String.format("Your order #%s has been shipped. %s", 
                        orderId,
                        order.getTrackingNumber() != null ? 
                                "Tracking number: " + order.getTrackingNumber() : "");
            case COMPLETED:
                return String.format("Your order #%s has been completed. Thank you for your purchase!", orderId);
            case CANCELED:
                return String.format("Your order #%s has been cancelled. Your payment will be refunded if applicable.", orderId);
            default:
                return String.format("Your order #%s status has been updated to %s.", orderId, newStatus);
        }
    }
}