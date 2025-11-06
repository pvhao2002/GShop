package com.ecommerce.service.impl;

import com.ecommerce.dto.admin.DashboardResponse;
import com.ecommerce.dto.common.PagedResponse;
import com.ecommerce.dto.order.*;
import com.ecommerce.entity.*;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.exception.ValidationException;
import com.ecommerce.repository.DashboardRepository;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.ProductVariantRepository;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of OrderService for order management operations.
 * Handles order creation, validation, retrieval, and cancellation.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrderServiceImpl implements OrderService {
    
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final DashboardRepository dashboardRepository;
    
    // Tax rate (10%)
    private static final BigDecimal TAX_RATE = new BigDecimal("0.10");
    // Shipping cost
    private static final BigDecimal SHIPPING_COST = new BigDecimal("25000"); // 25,000 VND
    
    @Override
    public OrderResponse createOrder(CreateOrderRequest request, String userEmail) {
        log.info("Creating order for user: {}", userEmail);
        
        // Find user
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        // Validate and process order items
        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;
        
        for (CreateOrderItemRequest itemRequest : request.getItems()) {
            // Validate product
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + itemRequest.getProductId()));
            
            if (!product.getIsActive()) {
                throw new ValidationException("Product is not available: " + product.getName());
            }
            
            ProductVariant variant = null;
            BigDecimal unitPrice = product.getPrice();
            
            // Validate variant if specified
            if (itemRequest.getVariantId() != null) {
                variant = productVariantRepository.findById(itemRequest.getVariantId())
                        .orElseThrow(() -> new ResourceNotFoundException("Product variant not found: " + itemRequest.getVariantId()));
                
                if (!variant.getProduct().getId().equals(product.getId())) {
                    throw new ValidationException("Variant does not belong to the specified product");
                }
                
                // Check variant inventory
                if (variant.getQuantity() < itemRequest.getQuantity()) {
                    throw new ValidationException("Insufficient inventory for variant: " + variant.getSize() + " " + variant.getColor());
                }
                
                // Add variant additional price if any
                if (variant.getAdditionalPrice() != null) {
                    unitPrice = unitPrice.add(variant.getAdditionalPrice());
                }
            }
            
            // Calculate item total
            BigDecimal itemTotal = unitPrice.multiply(new BigDecimal(itemRequest.getQuantity()));
            subtotal = subtotal.add(itemTotal);
            
            // Create order item
            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .variant(variant)
                    .quantity(itemRequest.getQuantity())
                    .unitPrice(unitPrice)
                    .totalPrice(itemTotal)
                    .build();
            
            orderItems.add(orderItem);
        }
        
        // Calculate tax and total
        BigDecimal tax = subtotal.multiply(TAX_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = subtotal.add(tax).add(SHIPPING_COST);
        
        // Create order
        Order order = Order.builder()
                .user(user)
                .shippingAddress(request.getShippingAddress())
                .paymentMethod(request.getPaymentMethod())
                .status(OrderStatus.PENDING)
                .subtotal(subtotal)
                .tax(tax)
                .shipping(SHIPPING_COST)
                .total(total)
                .build();
        
        // Set order reference in items
        orderItems.forEach(item -> item.setOrder(order));
        order.setItems(orderItems);
        
        // Save order
        Order savedOrder = orderRepository.save(order);
        
        // Update inventory for variants
        for (OrderItem item : orderItems) {
            if (item.getVariant() != null) {
                ProductVariant variant = item.getVariant();
                variant.setQuantity(variant.getQuantity() - item.getQuantity());
                productVariantRepository.save(variant);
            }
        }
        
        log.info("Order created successfully with ID: {} for user: {}", savedOrder.getId(), userEmail);
        
        return mapToOrderResponse(savedOrder);
    }
    
    @Override
    @Transactional(readOnly = true)
    public PagedResponse<OrderResponse> getUserOrders(String userEmail, int page, int size) {
        log.info("Retrieving orders for user: {}, page: {}, size: {}", userEmail, page, size);
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Order> orderPage = orderRepository.findByUser(user, pageable);
        
        List<OrderResponse> orderResponses = orderPage.getContent().stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
        
        return PagedResponse.<OrderResponse>builder()
                .content(orderResponses)
                .page(orderPage.getNumber())
                .size(orderPage.getSize())
                .totalElements(orderPage.getTotalElements())
                .totalPages(orderPage.getTotalPages())
                .first(orderPage.isFirst())
                .last(orderPage.isLast())
                .hasNext(orderPage.hasNext())
                .hasPrevious(orderPage.hasPrevious())
                .build();
    }
    
    @Override
    @Transactional(readOnly = true)
    public OrderDetailResponse getOrderById(Long orderId, String userEmail) {
        log.info("Retrieving order details for ID: {} by user: {}", orderId, userEmail);
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        
        // Security check - ensure user can access this order
        if (!order.getUser().getId().equals(user.getId())) {
            throw new ValidationException("You don't have permission to access this order");
        }
        
        return mapToOrderDetailResponse(order);
    }
    
    @Override
    public void cancelOrder(Long orderId, String userEmail) {
        log.info("Cancelling order ID: {} by user: {}", orderId, userEmail);
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        
        // Security check - ensure user can access this order
        if (!order.getUser().getId().equals(user.getId())) {
            throw new ValidationException("You don't have permission to cancel this order");
        }
        
        // Business rule - only allow cancellation of PENDING orders
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new ValidationException("Order cannot be cancelled. Current status: " + order.getStatus());
        }
        
        // Update order status
        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
        
        // Restore inventory for variants
        for (OrderItem item : order.getItems()) {
            if (item.getVariant() != null) {
                ProductVariant variant = item.getVariant();
                variant.setQuantity(variant.getQuantity() + item.getQuantity());
                productVariantRepository.save(variant);
            }
        }
        
        log.info("Order {} cancelled successfully", orderId);
    }
    
    /**
     * Maps Order entity to OrderResponse DTO.
     */
    private OrderResponse mapToOrderResponse(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .userId(order.getUser().getId())
                .userEmail(order.getUser().getEmail())
                .userName(order.getUser().getFirstName() + " " + order.getUser().getLastName())
                .shippingAddress(order.getShippingAddress())
                .paymentMethod(order.getPaymentMethod())
                .status(order.getStatus())
                .subtotal(order.getSubtotal())
                .tax(order.getTax())
                .shipping(order.getShipping())
                .total(order.getTotal())
                .itemCount(order.getItems().size())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
    
    /**
     * Maps Order entity to OrderDetailResponse DTO.
     */
    private OrderDetailResponse mapToOrderDetailResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems().stream()
                .map(this::mapToOrderItemResponse)
                .collect(Collectors.toList());
        
        return OrderDetailResponse.builder()
                .id(order.getId())
                .userId(order.getUser().getId())
                .userEmail(order.getUser().getEmail())
                .userName(order.getUser().getFirstName() + " " + order.getUser().getLastName())
                .items(itemResponses)
                .shippingAddress(order.getShippingAddress())
                .paymentMethod(order.getPaymentMethod())
                .status(order.getStatus())
                .subtotal(order.getSubtotal())
                .tax(order.getTax())
                .shipping(order.getShipping())
                .total(order.getTotal())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
    
    /**
     * Maps OrderItem entity to OrderItemResponse DTO.
     */
    private OrderItemResponse mapToOrderItemResponse(OrderItem item) {
        Product product = item.getProduct();
        ProductVariant variant = item.getVariant();
        
        return OrderItemResponse.builder()
                .id(item.getId())
                .productId(product.getId())
                .productName(product.getName())
                .productImage(product.getImages().isEmpty() ? null : product.getImages().get(0))
                .variantId(variant != null ? variant.getId() : null)
                .variantSize(variant != null ? variant.getSize() : null)
                .variantColor(variant != null ? variant.getColor() : null)
                .variantColorHex(variant != null ? variant.getColorHex() : null)
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .totalPrice(item.getTotalPrice())
                .build();
    }
    
    // Admin Methods Implementation
    
    @Override
    @Transactional(readOnly = true)
    public PagedResponse<OrderResponse> getAllOrders(int page, int size, OrderStatus status, 
                                                   LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Admin retrieving all orders - page: {}, size: {}, status: {}", page, size, status);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        
        // Build specification for filtering
        Specification<Order> spec = Specification.where(null);
        
        if (status != null) {
            spec = spec.and((root, query, criteriaBuilder) -> 
                criteriaBuilder.equal(root.get("status"), status));
        }
        
        if (startDate != null) {
            spec = spec.and((root, query, criteriaBuilder) -> 
                criteriaBuilder.greaterThanOrEqualTo(root.get("createdAt"), startDate));
        }
        
        if (endDate != null) {
            spec = spec.and((root, query, criteriaBuilder) -> 
                criteriaBuilder.lessThanOrEqualTo(root.get("createdAt"), endDate));
        }
        
        Page<Order> orderPage = orderRepository.findAll(spec, pageable);
        
        List<OrderResponse> orderResponses = orderPage.getContent().stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
        
        return PagedResponse.<OrderResponse>builder()
                .content(orderResponses)
                .page(orderPage.getNumber())
                .size(orderPage.getSize())
                .totalElements(orderPage.getTotalElements())
                .totalPages(orderPage.getTotalPages())
                .first(orderPage.isFirst())
                .last(orderPage.isLast())
                .hasNext(orderPage.hasNext())
                .hasPrevious(orderPage.hasPrevious())
                .build();
    }
    
    @Override
    public OrderResponse updateOrderStatus(Long orderId, UpdateOrderStatusRequest request) {
        log.info("Admin updating order status - ID: {}, new status: {}", orderId, request.getStatus());
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        
        OrderStatus oldStatus = order.getStatus();
        OrderStatus newStatus = request.getStatus();
        
        // Validate status transition
        if (!isValidStatusTransition(oldStatus, newStatus)) {
            throw new ValidationException("Invalid status transition from " + oldStatus + " to " + newStatus);
        }
        
        // Handle inventory restoration if order is cancelled
        if (newStatus == OrderStatus.CANCELLED && oldStatus != OrderStatus.CANCELLED) {
            for (OrderItem item : order.getItems()) {
                if (item.getVariant() != null) {
                    ProductVariant variant = item.getVariant();
                    variant.setQuantity(variant.getQuantity() + item.getQuantity());
                    productVariantRepository.save(variant);
                }
            }
        }
        
        order.setStatus(newStatus);
        Order savedOrder = orderRepository.save(order);
        
        log.info("Order status updated successfully - ID: {}, status: {} -> {}", orderId, oldStatus, newStatus);
        
        return mapToOrderResponse(savedOrder);
    }
    
    @Override
    @Transactional(readOnly = true)
    public DashboardResponse getDashboardMetrics() {
        log.info("Generating admin dashboard metrics");
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime last30Days = now.minusDays(30);
        LocalDateTime last12Months = now.minusMonths(12);
        
        // Get overview metrics
        Object[] overview = dashboardRepository.getDashboardOverview();
        
        // Get recent activity (last 30 days)
        Object[] recentActivity = dashboardRepository.getRecentActivity(last30Days);
        
        // Get inventory status
        Object[] inventoryStatus = dashboardRepository.getInventoryStatus(10); // Low stock threshold: 10
        
        // Get customer analytics
        Object[] customerAnalytics = dashboardRepository.getCustomerAnalytics();
        
        // Get top products (top 5)
        List<Object[]> topProductsData = dashboardRepository.getTopProductsByRevenue(5);
        List<DashboardResponse.TopProductResponse> topProducts = topProductsData.stream()
                .map(data -> DashboardResponse.TopProductResponse.builder()
                        .productId(((Number) data[0]).longValue())
                        .productName((String) data[1])
                        .totalRevenue(((Number) data[2]).doubleValue())
                        .totalQuantitySold(((Number) data[3]).longValue())
                        .orderCount(((Number) data[4]).longValue())
                        .build())
                .collect(Collectors.toList());
        
        // Get monthly growth trends (last 12 months)
        List<Object[]> monthlyGrowthData = dashboardRepository.getMonthlyGrowthTrends(last12Months, now);
        List<DashboardResponse.MonthlyGrowthResponse> monthlyGrowth = monthlyGrowthData.stream()
                .map(data -> DashboardResponse.MonthlyGrowthResponse.builder()
                        .month((String) data[0])
                        .orders(((Number) data[1]).longValue())
                        .revenue(((Number) data[2]).doubleValue())
                        .newCustomers(((Number) data[3]).longValue())
                        .build())
                .collect(Collectors.toList());
        
        return DashboardResponse.builder()
                // Overview metrics
                .totalCustomers(((Number) overview[0]).longValue())
                .totalProducts(((Number) overview[1]).longValue())
                .totalOrders(((Number) overview[2]).longValue())
                .completedOrders(((Number) overview[3]).longValue())
                .totalRevenue(((Number) overview[4]).doubleValue())
                .averageOrderValue(((Number) overview[5]).doubleValue())
                .totalCategories(((Number) overview[6]).longValue())
                .pendingOrders(((Number) overview[7]).longValue())
                
                // Recent activity
                .recentOrders(((Number) recentActivity[0]).longValue())
                .newCustomers(((Number) recentActivity[1]).longValue())
                .newProducts(((Number) recentActivity[2]).longValue())
                .recentPendingOrders(((Number) recentActivity[3]).longValue())
                
                // Inventory status
                .productsInStock(((Number) inventoryStatus[1]).longValue())
                .outOfStockProducts(((Number) inventoryStatus[2]).longValue())
                .lowStockProducts(((Number) inventoryStatus[3]).longValue())
                .totalInventoryUnits(((Number) inventoryStatus[4]).longValue())
                
                // Customer analytics
                .customersWithOrders(((Number) customerAnalytics[1]).longValue())
                .averageOrdersPerCustomer(((Number) customerAnalytics[2]).doubleValue())
                .averageSpentPerCustomer(((Number) customerAnalytics[3]).doubleValue())
                
                // Top products and growth trends
                .topProducts(topProducts)
                .monthlyGrowth(monthlyGrowth)
                
                .generatedAt(now)
                .build();
    }
    
    /**
     * Validates if a status transition is allowed.
     */
    private boolean isValidStatusTransition(OrderStatus from, OrderStatus to) {
        if (from == to) {
            return true; // Same status is always valid
        }
        
        switch (from) {
            case PENDING:
                return to == OrderStatus.PROCESSING || to == OrderStatus.CANCELLED;
            case PROCESSING:
                return to == OrderStatus.SHIPPED || to == OrderStatus.CANCELLED;
            case SHIPPED:
                return to == OrderStatus.DELIVERED;
            case DELIVERED:
                return false; // Delivered orders cannot be changed
            case CANCELLED:
                return false; // Cancelled orders cannot be changed
            default:
                return false;
        }
    }
}