package com.ecommerce.service;

import com.ecommerce.entity.Order;
import com.ecommerce.entity.OrderStatus;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class WebSocketNotificationService {
    
    private static final Logger logger = LoggerFactory.getLogger(WebSocketNotificationService.class);
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    /**
     * Send real-time order status update to customer
     */
    public void sendOrderStatusUpdate(Order order, OrderStatus oldStatus, OrderStatus newStatus) {
        try {
            Map<String, Object> message = new HashMap<>();
            message.put("type", "ORDER_STATUS_UPDATE");
            message.put("orderId", order.getId().toString());
            message.put("oldStatus", oldStatus.toString());
            message.put("newStatus", newStatus.toString());
            message.put("timestamp", System.currentTimeMillis());
            
            // Send to specific user
            String destination = "/user/" + order.getUser().getId() + "/queue/orders";
            messagingTemplate.convertAndSend(destination, message);
            
            logger.info("Sent real-time order status update to user {}: {} -> {}", 
                    order.getUser().getId(), oldStatus, newStatus);
            
        } catch (Exception e) {
            logger.error("Failed to send real-time order status update: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Send real-time notification to admin about new order
     */
    public void sendNewOrderNotificationToAdmin(Order order) {
        try {
            Map<String, Object> message = new HashMap<>();
            message.put("type", "NEW_ORDER");
            message.put("orderId", order.getId().toString());
            message.put("customerName", order.getUser().getFullName());
            message.put("totalAmount", order.getTotalAmount());
            message.put("timestamp", System.currentTimeMillis());
            
            // Send to all admin users
            messagingTemplate.convertAndSend("/topic/admin/orders", message);
            
            logger.info("Sent new order notification to admins: order {}", order.getId());
            
        } catch (Exception e) {
            logger.error("Failed to send new order notification to admins: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Send real-time payment confirmation to admin
     */
    public void sendPaymentConfirmationToAdmin(Order order) {
        try {
            Map<String, Object> message = new HashMap<>();
            message.put("type", "PAYMENT_CONFIRMED");
            message.put("orderId", order.getId().toString());
            message.put("customerName", order.getUser().getFullName());
            message.put("amount", order.getTotalAmount());
            message.put("timestamp", System.currentTimeMillis());
            
            // Send to all admin users
            messagingTemplate.convertAndSend("/topic/admin/payments", message);
            
            logger.info("Sent payment confirmation to admins: order {}", order.getId());
            
        } catch (Exception e) {
            logger.error("Failed to send payment confirmation to admins: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Send general notification to user
     */
    public void sendNotificationToUser(Long userId, String type, Map<String, Object> data) {
        try {
            Map<String, Object> message = new HashMap<>();
            message.put("type", type);
            message.put("data", data);
            message.put("timestamp", System.currentTimeMillis());
            
            String destination = "/user/" + userId + "/queue/notifications";
            messagingTemplate.convertAndSend(destination, message);
            
            logger.info("Sent notification to user {}: {}", userId, type);
            
        } catch (Exception e) {
            logger.error("Failed to send notification to user {}: {}", userId, e.getMessage(), e);
        }
    }
    
    /**
     * Send general notification to all admins
     */
    public void sendNotificationToAdmins(String type, Map<String, Object> data) {
        try {
            Map<String, Object> message = new HashMap<>();
            message.put("type", type);
            message.put("data", data);
            message.put("timestamp", System.currentTimeMillis());
            
            messagingTemplate.convertAndSend("/topic/admin/notifications", message);
            
            logger.info("Sent notification to admins: {}", type);
            
        } catch (Exception e) {
            logger.error("Failed to send notification to admins: {}", e.getMessage(), e);
        }
    }
}