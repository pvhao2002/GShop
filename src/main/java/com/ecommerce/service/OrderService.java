package com.ecommerce.service;

import com.ecommerce.dto.admin.DashboardResponse;
import com.ecommerce.dto.common.PagedResponse;
import com.ecommerce.dto.order.CreateOrderRequest;
import com.ecommerce.dto.order.OrderDetailResponse;
import com.ecommerce.dto.order.OrderResponse;
import com.ecommerce.dto.order.UpdateOrderStatusRequest;
import com.ecommerce.entity.OrderStatus;

import java.time.LocalDateTime;

/**
 * Service interface for order management operations.
 * Handles order creation, retrieval, and cancellation for users.
 * Also provides admin functionality for order management and analytics.
 */
public interface OrderService {
    
    /**
     * Create a new order for the authenticated user.
     * Validates items, calculates totals, and creates order record.
     * 
     * @param request Order creation request with items and shipping details
     * @param userEmail Email of the authenticated user
     * @return Created order response
     */
    OrderResponse createOrder(CreateOrderRequest request, String userEmail);
    
    /**
     * Get paginated order history for the authenticated user.
     * 
     * @param userEmail Email of the authenticated user
     * @param page Page number (0-based)
     * @param size Page size
     * @return Paginated list of user orders
     */
    PagedResponse<OrderResponse> getUserOrders(String userEmail, int page, int size);
    
    /**
     * Get detailed order information by ID.
     * Includes security check to ensure user can access the order.
     * 
     * @param orderId Order ID
     * @param userEmail Email of the authenticated user
     * @return Detailed order information
     */
    OrderDetailResponse getOrderById(Long orderId, String userEmail);
    
    /**
     * Cancel an order if it's in a cancellable state.
     * Only allows cancellation for PENDING orders.
     * 
     * @param orderId Order ID to cancel
     * @param userEmail Email of the authenticated user
     */
    void cancelOrder(Long orderId, String userEmail);
    
    // Admin Methods
    
    /**
     * Get all orders with pagination and optional filtering.
     * Admin-only method to retrieve all orders in the system.
     * 
     * @param page Page number (0-based)
     * @param size Page size
     * @param status Optional status filter
     * @param startDate Optional start date filter
     * @param endDate Optional end date filter
     * @return Paginated list of all orders
     */
    PagedResponse<OrderResponse> getAllOrders(int page, int size, OrderStatus status, 
                                            LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * Update order status.
     * Admin-only method to change order status.
     * 
     * @param orderId Order ID
     * @param request Status update request
     * @return Updated order response
     */
    OrderResponse updateOrderStatus(Long orderId, UpdateOrderStatusRequest request);
    
    /**
     * Get comprehensive dashboard metrics.
     * Admin-only method to retrieve business analytics and KPIs.
     * 
     * @return Dashboard metrics and analytics
     */
    DashboardResponse getDashboardMetrics();
}