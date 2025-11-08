package com.ecommerce.controller;

import com.ecommerce.dto.admin.DashboardResponse;
import com.ecommerce.dto.admin.UpdateUserStatusRequest;
import com.ecommerce.dto.admin.UserResponse;
import com.ecommerce.dto.common.MessageResponse;
import com.ecommerce.dto.common.PagedResponse;
import com.ecommerce.dto.order.OrderResponse;
import com.ecommerce.dto.order.UpdateOrderStatusRequest;
import com.ecommerce.dto.product.*;
import com.ecommerce.entity.OrderStatus;
import com.ecommerce.service.OrderService;
import com.ecommerce.service.ProductService;
import com.ecommerce.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

/**
 * REST Controller for admin management endpoints.
 * Provides endpoints for product, order, user management and dashboard analytics.
 * All endpoints require ADMIN role authorization.
 */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Slf4j
public class AdminController {
    
    private final ProductService productService;
    private final OrderService orderService;
    private final UserService userService;
    
    // Product Management Endpoints
    
    /**
     * Create a new product.
     * Supports product creation with variants and image URLs.
     * 
     * @param request Product creation request
     * @return Created product information
     */
    @PostMapping("/products")
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody CreateProductRequest request) {
        ProductResponse createdProduct = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdProduct);
    }
    
    /**
     * Update an existing product.
     * Supports updating all product fields including variants.
     * 
     * @param id Product ID
     * @param request Product update request
     * @return Updated product information
     */
    @PutMapping("/products/{id}")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProductRequest request) {
        ProductResponse updatedProduct = productService.updateProduct(id, request);
        return ResponseEntity.ok(updatedProduct);
    }
    
    /**
     * Delete a product (soft delete).
     * Sets the product's isActive flag to false instead of physical deletion.
     * 
     * @param id Product ID
     * @return Success message
     */
    @DeleteMapping("/products/{id}")
    public ResponseEntity<MessageResponse> deleteProduct(@PathVariable Long id) {
        log.debug("DELETE /api/admin/products/{}", id);
        
        productService.deleteProduct(id);
        
        log.info("Deleted product with id: {}", id);
        return ResponseEntity.ok(MessageResponse.builder()
                .message("Product deleted successfully")
                .build());
    }
    
    /**
     * Update product status (activate/deactivate).
     * Allows toggling product visibility without full deletion.
     * 
     * @param id Product ID
     * @param request Status update request
     * @return Updated product information
     */
    @PutMapping("/products/{id}/status")
    public ResponseEntity<ProductResponse> updateProductStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProductStatusRequest request) {
        
        log.debug("PUT /api/admin/products/{}/status - Setting active: {}", id, request.getIsActive());
        
        ProductResponse updatedProduct = productService.updateProductStatus(id, request);
        
        log.info("Updated product status - id: {}, active: {}", id, request.getIsActive());
        return ResponseEntity.ok(updatedProduct);
    }
    
    // Category Management Endpoints
    
    /**
     * Create a new category.
     * Supports hierarchical categories with parent-child relationships.
     * 
     * @param request Category creation request
     * @return Created category information
     */
    @PostMapping("/categories")
    public ResponseEntity<CategoryResponse> createCategory(@Valid @RequestBody CreateCategoryRequest request) {
        log.debug("POST /api/admin/categories - Creating category: {}", request.getName());
        
        CategoryResponse createdCategory = productService.createCategory(request);
        
        log.info("Created category with id: {}", createdCategory.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdCategory);
    }
    
    /**
     * Update an existing category.
     * Allows updating name, description, and parent category.
     * 
     * @param id Category ID
     * @param request Category update request
     * @return Updated category information
     */
    @PutMapping("/categories/{id}")
    public ResponseEntity<CategoryResponse> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCategoryRequest request) {
        
        log.debug("PUT /api/admin/categories/{} - Updating category", id);
        
        CategoryResponse updatedCategory = productService.updateCategory(id, request);
        
        log.info("Updated category with id: {}", updatedCategory.getId());
        return ResponseEntity.ok(updatedCategory);
    }
    
    /**
     * Delete a category.
     * Only allows deletion of categories without products or child categories.
     * 
     * @param id Category ID
     * @return Success message
     */
    @DeleteMapping("/categories/{id}")
    public ResponseEntity<MessageResponse> deleteCategory(@PathVariable Long id) {
        log.debug("DELETE /api/admin/categories/{}", id);
        
        productService.deleteCategory(id);
        
        log.info("Deleted category with id: {}", id);
        return ResponseEntity.ok(MessageResponse.builder()
                .message("Category deleted successfully")
                .build());
    }
    
    // Order Management Endpoints
    
    /**
     * Get all orders with pagination and optional filtering.
     * Supports filtering by status, date range for comprehensive order management.
     * 
     * @param page Page number (0-based)
     * @param size Page size
     * @param status Optional order status filter
     * @param startDate Optional start date filter
     * @param endDate Optional end date filter
     * @return Paginated list of orders
     */
    @GetMapping("/orders")
    public ResponseEntity<PagedResponse<OrderResponse>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        PagedResponse<OrderResponse> orders = orderService.getAllOrders(page, size, status, startDate, endDate);
        return ResponseEntity.ok(orders);
    }
    
    /**
     * Update order status.
     * Allows administrators to change order status with proper validation.
     * 
     * @param id Order ID
     * @param request Status update request
     * @return Updated order information
     */
    @PutMapping("/orders/{id}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        
        log.debug("PUT /api/admin/orders/{}/status - new status: {}", id, request.getStatus());
        
        OrderResponse updatedOrder = orderService.updateOrderStatus(id, request);
        
        log.info("Updated order status - ID: {}, status: {}", id, request.getStatus());
        return ResponseEntity.ok(updatedOrder);
    }
    
    // User Management Endpoints
    
    /**
     * Get all users with pagination and optional search.
     * Supports searching by email, name, or phone number.
     * 
     * @param page Page number (0-based)
     * @param size Page size
     * @param search Optional search term
     * @return Paginated list of users with statistics
     */
    @GetMapping("/users")
    public ResponseEntity<PagedResponse<UserResponse>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search) {
        
        log.debug("GET /api/admin/users - page: {}, size: {}, search: {}", page, size, search);
        
        PagedResponse<UserResponse> users = userService.getAllUsers(page, size, search);
        
        log.info("Retrieved {} users for admin", users.getTotalElements());
        return ResponseEntity.ok(users);
    }
    
    /**
     * Get user details by ID.
     * Provides comprehensive user information including order statistics.
     * 
     * @param id User ID
     * @return Detailed user information
     */
    @GetMapping("/users/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        log.debug("GET /api/admin/users/{}", id);
        
        UserResponse user = userService.getUserById(id);
        
        log.info("Retrieved user details for ID: {}", id);
        return ResponseEntity.ok(user);
    }
    
    /**
     * Update user account status.
     * Allows administrators to activate or deactivate user accounts.
     * 
     * @param id User ID
     * @param request Status update request
     * @return Updated user information
     */
    @PutMapping("/users/{id}/status")
    public ResponseEntity<UserResponse> updateUserStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserStatusRequest request) {
        
        log.debug("PUT /api/admin/users/{}/status - active: {}", id, request.getIsActive());
        
        UserResponse updatedUser = userService.updateUserStatus(id, request);
        
        log.info("Updated user status - ID: {}, active: {}", id, request.getIsActive());
        return ResponseEntity.ok(updatedUser);
    }
    
    // Dashboard Analytics Endpoint
    
    /**
     * Get comprehensive dashboard metrics and analytics.
     * Provides business KPIs, recent activity, inventory status, and growth trends.
     * 
     * @return Dashboard metrics and analytics
     */
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponse> getDashboardMetrics() {
        log.debug("GET /api/admin/dashboard");
        
        DashboardResponse dashboard = orderService.getDashboardMetrics();
        
        log.info("Generated dashboard metrics with {} total orders and {} total revenue", 
                dashboard.getTotalOrders(), dashboard.getTotalRevenue());
        return ResponseEntity.ok(dashboard);
    }
}