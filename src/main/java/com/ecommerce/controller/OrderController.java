package com.ecommerce.controller;

import com.ecommerce.dto.common.MessageResponse;
import com.ecommerce.dto.common.PagedResponse;
import com.ecommerce.dto.order.CreateOrderRequest;
import com.ecommerce.dto.order.OrderDetailResponse;
import com.ecommerce.dto.order.OrderResponse;
import com.ecommerce.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for order management operations.
 * Provides endpoints for order creation, retrieval, and cancellation.
 * All endpoints require USER role authentication.
 */
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Slf4j
public class OrderController {
    
    private final OrderService orderService;
    
    /**
     * Create a new order for the authenticated user.
     * 
     * @param request Order creation request with items and shipping details
     * @param authentication Spring Security authentication object
     * @return Created order response
     */
    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<OrderResponse> createOrder(
            @Valid @RequestBody CreateOrderRequest request,
            Authentication authentication) {
        
        log.info("Creating order for user: {}", authentication.getName());
        
        OrderResponse response = orderService.createOrder(request, authentication.getName());
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    /**
     * Get paginated order history for the authenticated user.
     * 
     * @param page Page number (0-based, default: 0)
     * @param size Page size (default: 10)
     * @param authentication Spring Security authentication object
     * @return Paginated list of user orders
     */
    @GetMapping("/my-orders")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<PagedResponse<OrderResponse>> getMyOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        
        log.info("Retrieving orders for user: {}, page: {}, size: {}", 
                authentication.getName(), page, size);
        
        PagedResponse<OrderResponse> response = orderService.getUserOrders(
                authentication.getName(), page, size);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get detailed order information by ID.
     * Includes security check to ensure user can access the order.
     * 
     * @param id Order ID
     * @param authentication Spring Security authentication object
     * @return Detailed order information
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<OrderDetailResponse> getOrderById(
            @PathVariable Long id,
            Authentication authentication) {
        
        log.info("Retrieving order details for ID: {} by user: {}", 
                id, authentication.getName());
        
        OrderDetailResponse response = orderService.getOrderById(id, authentication.getName());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Cancel an order if it's in a cancellable state.
     * Only allows cancellation for PENDING orders.
     * 
     * @param id Order ID to cancel
     * @param authentication Spring Security authentication object
     * @return Success message
     */
    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<MessageResponse> cancelOrder(
            @PathVariable Long id,
            Authentication authentication) {
        
        log.info("Cancelling order ID: {} by user: {}", id, authentication.getName());
        
        orderService.cancelOrder(id, authentication.getName());
        
        MessageResponse response = MessageResponse.of("Order cancelled successfully");
        
        return ResponseEntity.ok(response);
    }
}