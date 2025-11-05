package com.ecommerce.service;

import com.ecommerce.dto.request.CreateOrderRequest;
import com.ecommerce.dto.request.OrderItemRequest;
import com.ecommerce.dto.request.UpdateOrderStatusRequest;
import com.ecommerce.dto.response.OrderItemResponse;
import com.ecommerce.dto.response.OrderResponse;
import com.ecommerce.dto.response.OrderSummaryResponse;
import com.ecommerce.dto.response.PagedResponse;
import com.ecommerce.entity.*;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.OrderItemRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    // Tax rate (10%)
    private static final BigDecimal TAX_RATE = new BigDecimal("0.10");

    // Shipping cost
    private static final BigDecimal SHIPPING_COST = new BigDecimal("25000"); // 25,000 VND

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request, UserPrincipal userPrincipal) {
        // Get user
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userPrincipal.getId()));

        // Validate order items and calculate totals
        BigDecimal subtotal = BigDecimal.ZERO;

        for (OrderItemRequest itemRequest : request.getOrderItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", itemRequest.getProductId()));

            // Check if product is active
            if (!product.getActive()) {
                throw new BadRequestException("Product " + product.getName() + " is not available");
            }

            // Check stock availability
            if (product.getStockQuantity() < itemRequest.getQuantity()) {
                throw new BadRequestException("Insufficient stock for product " + product.getName() +
                        ". Available: " + product.getStockQuantity() + ", Requested: " + itemRequest.getQuantity());
            }

            // Validate size and color if specified
            if (itemRequest.getSelectedSize() != null && !product.getSizes().contains(itemRequest.getSelectedSize())) {
                throw new BadRequestException("Invalid size " + itemRequest.getSelectedSize() + " for product " + product.getName());
            }

            if (itemRequest.getSelectedColor() != null && !product.getColors().contains(itemRequest.getSelectedColor())) {
                throw new BadRequestException("Invalid color " + itemRequest.getSelectedColor() + " for product " + product.getName());
            }

            // Calculate item total
            BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity()));
            subtotal = subtotal.add(itemTotal);
        }

        // Calculate tax and total
        BigDecimal taxAmount = subtotal.multiply(TAX_RATE);
        BigDecimal totalAmount = subtotal.add(taxAmount).add(SHIPPING_COST);

        // Create order
        Order order = new Order();
        order.setUser(user);
        order.setSubtotal(subtotal);
        order.setTaxAmount(taxAmount);
        order.setShippingCost(SHIPPING_COST);
        order.setTotalAmount(totalAmount);
        order.setPaymentMethod(request.getPaymentMethod());
        order.setShippingAddress(request.getShippingAddress());
        order.setBillingAddress(request.getBillingAddress());
        order.setNotes(request.getNotes());
        order.setStatus(OrderStatus.PENDING);
        order.setPaymentStatus(PaymentStatus.PENDING);

        // Generate tracking number
        order.setTrackingNumber(generateTrackingNumber());

        // Set estimated delivery date (7 days from now)
        order.setEstimatedDeliveryDate(LocalDateTime.now().plusDays(7));

        // Save order
        order = orderRepository.save(order);

        // Send order creation notification
        notificationService.sendOrderCreatedNotification(order);

        // Create order items and update stock
        for (OrderItemRequest itemRequest : request.getOrderItems()) {
            Product product = productRepository.findById(itemRequest.getProductId()).get();

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setUnitPrice(product.getPrice());
            orderItem.setSelectedSize(itemRequest.getSelectedSize());
            orderItem.setSelectedColor(itemRequest.getSelectedColor());

            orderItemRepository.save(orderItem);

            // Update product stock
            product.setStockQuantity(product.getStockQuantity() - itemRequest.getQuantity());
            productRepository.save(product);
        }

        return convertToOrderResponse(order);
    }

    public PagedResponse<OrderSummaryResponse> getUserOrders(UserPrincipal userPrincipal, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ?
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Order> orders = orderRepository.findByUserId(userPrincipal.getId(), pageable);

        List<OrderSummaryResponse> orderResponses = orders.getContent().stream()
                .map(this::convertToOrderSummaryResponse)
                .collect(Collectors.toList());

        return new PagedResponse<>(orders, orderResponses);
    }

    public PagedResponse<OrderSummaryResponse> getAllOrders(int page, int size, String sortBy, String sortDir,
                                                            OrderStatus status, PaymentStatus paymentStatus) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ?
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Order> orders;

        if (status != null && paymentStatus != null) {
            orders = orderRepository.findWithFilters(null, status, null, paymentStatus, null, null, pageable);
        } else if (status != null) {
            orders = orderRepository.findByStatus(status, pageable);
        } else if (paymentStatus != null) {
            orders = orderRepository.findByPaymentStatus(paymentStatus, pageable);
        } else {
            orders = orderRepository.findAll(pageable);
        }

        List<OrderSummaryResponse> orderResponses = orders.getContent().stream()
                .map(this::convertToOrderSummaryResponse)
                .collect(Collectors.toList());

        return new PagedResponse<>(orders, orderResponses);
    }

    public OrderResponse getOrderById(Long orderId, UserPrincipal userPrincipal) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        // Check if user can access this order (user can only access their own orders, admin can access all)
        if (!userPrincipal.getAuthorities().stream().anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"))
                && !order.getUser().getId().equals(userPrincipal.getId())) {
            throw new BadRequestException("You don't have permission to access this order");
        }

        return convertToOrderResponse(order);
    }

    public OrderResponse getOrderByTrackingNumber(String trackingNumber, UserPrincipal userPrincipal) {
        Order order = orderRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "trackingNumber", trackingNumber));

        // Check if user can access this order
        if (!userPrincipal.getAuthorities().stream().anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"))
                && !order.getUser().getId().equals(userPrincipal.getId())) {
            throw new BadRequestException("You don't have permission to access this order");
        }

        return convertToOrderResponse(order);
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        OrderStatus oldStatus = order.getStatus();
        OrderStatus newStatus = request.getStatus();

        // Validate status transition
        validateStatusTransition(oldStatus, newStatus);

        // Update order status
        order.setStatus(newStatus);

        // Update tracking number if provided
        if (request.getTrackingNumber() != null && !request.getTrackingNumber().trim().isEmpty()) {
            order.setTrackingNumber(request.getTrackingNumber());
        }

        // Set timestamps based on status
        LocalDateTime now = LocalDateTime.now();
        switch (newStatus) {
            case SHIPPED:
                order.setShippedAt(now);
                // Update estimated delivery date to 3 days from shipping
                order.setEstimatedDeliveryDate(now.plusDays(3));
                break;
            case COMPLETED:
                order.setDeliveredAt(now);
                break;
            case CANCELED:
                // Restore product stock when order is canceled
                restoreProductStock(order);
                break;
        }

        order = orderRepository.save(order);

        // Send notification to customer about status change
        notificationService.sendOrderStatusNotification(order, oldStatus, newStatus);

        return convertToOrderResponse(order);
    }

    @Transactional
    public OrderResponse cancelOrder(Long orderId, UserPrincipal userPrincipal) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        // Check if user can cancel this order
        if (!order.getUser().getId().equals(userPrincipal.getId())) {
            throw new BadRequestException("You can only cancel your own orders");
        }

        // Check if order can be canceled
        if (!order.canBeCanceled()) {
            throw new BadRequestException("Order cannot be canceled. Current status: " + order.getStatus());
        }

        // Cancel the order
        order.setStatus(OrderStatus.CANCELED);

        // Restore product stock
        restoreProductStock(order);

        order = orderRepository.save(order);

        // Send cancellation notification
        notificationService.sendOrderCancelledNotification(order);

        return convertToOrderResponse(order);
    }

    private void validateStatusTransition(OrderStatus oldStatus, OrderStatus newStatus) {
        // Define valid status transitions
        switch (oldStatus) {
            case PENDING:
                if (newStatus != OrderStatus.CONFIRMED && newStatus != OrderStatus.CANCELED) {
                    throw new BadRequestException("Invalid status transition from " + oldStatus + " to " + newStatus);
                }
                break;
            case CONFIRMED:
                if (newStatus != OrderStatus.SHIPPED && newStatus != OrderStatus.CANCELED) {
                    throw new BadRequestException("Invalid status transition from " + oldStatus + " to " + newStatus);
                }
                break;
            case SHIPPED:
                if (newStatus != OrderStatus.COMPLETED) {
                    throw new BadRequestException("Invalid status transition from " + oldStatus + " to " + newStatus);
                }
                break;
            case COMPLETED:
            case CANCELED:
                throw new BadRequestException("Cannot change status from " + oldStatus);
        }
    }

    private void restoreProductStock(Order order) {
        for (OrderItem orderItem : order.getOrderItems()) {
            Product product = orderItem.getProduct();
            product.setStockQuantity(product.getStockQuantity() + orderItem.getQuantity());
            productRepository.save(product);
        }
    }

    private String generateTrackingNumber() {
        return "TRK" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private OrderResponse convertToOrderResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setUserId(order.getUser().getId());
        response.setUserEmail(order.getUser().getEmail());
        response.setUserName(order.getUser().getFirstName() + " " + order.getUser().getLastName());
        response.setTotalAmount(order.getTotalAmount());
        response.setSubtotal(order.getSubtotal());
        response.setTaxAmount(order.getTaxAmount());
        response.setShippingCost(order.getShippingCost());
        response.setStatus(order.getStatus());
        response.setPaymentMethod(order.getPaymentMethod());
        response.setPaymentStatus(order.getPaymentStatus());
        response.setShippingAddress(order.getShippingAddress());
        response.setBillingAddress(order.getBillingAddress());
        response.setNotes(order.getNotes());
        response.setTrackingNumber(order.getTrackingNumber());
        response.setEstimatedDeliveryDate(order.getEstimatedDeliveryDate());
        response.setShippedAt(order.getShippedAt());
        response.setDeliveredAt(order.getDeliveredAt());
        response.setCreatedAt(order.getCreatedAt());
        response.setUpdatedAt(order.getUpdatedAt());
        response.setTotalItemCount(order.getTotalItemCount());
        response.setCanBeCanceled(order.canBeCanceled());

        // Convert order items
        List<OrderItemResponse> orderItemResponses = order.getOrderItems().stream()
                .map(this::convertToOrderItemResponse)
                .collect(Collectors.toList());
        response.setOrderItems(orderItemResponses);

        return response;
    }

    private OrderSummaryResponse convertToOrderSummaryResponse(Order order) {
        OrderSummaryResponse response = new OrderSummaryResponse();
        response.setId(order.getId());
        response.setStatus(order.getStatus());
        response.setPaymentMethod(order.getPaymentMethod());
        response.setPaymentStatus(order.getPaymentStatus());
        response.setTotalAmount(order.getTotalAmount());
        response.setTotalItemCount(order.getTotalItemCount());
        response.setCreatedAt(order.getCreatedAt());
        response.setEstimatedDeliveryDate(order.getEstimatedDeliveryDate());
        response.setTrackingNumber(order.getTrackingNumber());
        response.setCanBeCanceled(order.canBeCanceled());

        return response;
    }

    private OrderItemResponse convertToOrderItemResponse(OrderItem orderItem) {
        OrderItemResponse response = new OrderItemResponse();
        response.setId(orderItem.getId());
        response.setProductId(orderItem.getProduct().getId());
        response.setProductName(orderItem.getProduct().getName());

        // Get first image if available
        if (orderItem.getProduct().getImages() != null && !orderItem.getProduct().getImages().isEmpty()) {
            response.setProductImage(orderItem.getProduct().getImages().get(0));
        }

        response.setQuantity(orderItem.getQuantity());
        response.setUnitPrice(orderItem.getUnitPrice());
        response.setTotalPrice(orderItem.getTotalPrice());
        response.setSelectedSize(orderItem.getSelectedSize());
        response.setSelectedColor(orderItem.getSelectedColor());

        return response;
    }
}