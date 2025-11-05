package com.ecommerce.controller;

import com.ecommerce.dto.request.CreateOrderRequest;
import com.ecommerce.dto.request.UpdateOrderStatusRequest;
import com.ecommerce.dto.response.ApiResponse;
import com.ecommerce.dto.response.OrderResponse;
import com.ecommerce.dto.response.OrderSummaryResponse;
import com.ecommerce.dto.response.PagedResponse;
import com.ecommerce.entity.OrderStatus;
import com.ecommerce.entity.PaymentStatus;
import com.ecommerce.security.UserPrincipal;
import com.ecommerce.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders")
@Tag(name = "Order Management", description = "Order processing and management including creation, tracking, and status updates")
public class OrderController {
    
    @Autowired
    private OrderService orderService;
    
    @PostMapping
    @Operation(
        summary = "Create a new order",
        description = """
            Create a new order from cart items with shipping information and payment method selection.
            The order will be created with PENDING status and can be processed for payment.
            
            **Order Process:**
            1. Validate cart items and stock availability
            2. Calculate total amount including taxes and shipping
            3. Create order with PENDING status
            4. Reserve inventory for order items
            5. Return order details for payment processing
            
            **Payment Methods:** COD, MOMO, VNPAY
            """,
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Order creation details including items, shipping address, and payment method",
            required = true,
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = CreateOrderRequest.class),
                examples = @ExampleObject(
                    name = "Create Order Example",
                    value = """
                        {
                          "orderItems": [
                            {
                              "productId": 1,
                              "quantity": 2,
                              "selectedSize": "M",
                              "selectedColor": "Blue"
                            },
                            {
                              "productId": 2,
                              "quantity": 1,
                              "selectedSize": "L",
                              "selectedColor": "Red"
                            }
                          ],
                          "shippingAddress": "123 Main St, City, State 12345",
                          "paymentMethod": "COD",
                          "notes": "Please deliver after 6 PM"
                        }
                        """
                )
            )
        )
    )
    @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "201",
            description = "Order created successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ApiResponse.class),
                examples = @ExampleObject(
                    name = "Order Created Response",
                    value = """
                        {
                          "success": true,
                          "message": "Order created successfully",
                          "data": {
                            "id": 1,
                            "trackingNumber": "ORD-2024-001",
                            "status": "PENDING",
                            "paymentStatus": "PENDING",
                            "paymentMethod": "COD",
                            "totalAmount": 89.97,
                            "shippingAddress": "123 Main St, City, State 12345",
                            "orderItems": [
                              {
                                "id": 1,
                                "productId": 1,
                                "productName": "Premium T-Shirt",
                                "quantity": 2,
                                "unitPrice": 29.99,
                                "selectedSize": "M",
                                "selectedColor": "Blue"
                              }
                            ],
                            "createdAt": "2024-01-15T10:30:00Z"
                          }
                        }
                        """
                )
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", ref = "#/components/responses/ValidationError"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", ref = "#/components/responses/UnauthorizedError"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "409",
            description = "Insufficient stock or product unavailable",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = """
                        {
                          "error": {
                            "code": "INSUFFICIENT_STOCK",
                            "message": "Insufficient stock for product: Premium T-Shirt (Size: M, Color: Blue)",
                            "timestamp": "2024-01-15T10:30:00Z"
                          }
                        }
                        """
                )
            )
        )
    })
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            @Valid @RequestBody CreateOrderRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        OrderResponse order = orderService.createOrder(request, userPrincipal);
        ApiResponse<OrderResponse> response = new ApiResponse<>(true, "Order created successfully", order);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping("/my-orders")
    @Operation(summary = "Get user's orders", description = "Get paginated list of current user's orders")
    public ResponseEntity<ApiResponse<PagedResponse<OrderSummaryResponse>>> getUserOrders(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(defaultValue = "desc") String sortDir,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        PagedResponse<OrderSummaryResponse> orders = orderService.getUserOrders(userPrincipal, page, size, sortBy, sortDir);
        ApiResponse<PagedResponse<OrderSummaryResponse>> response = new ApiResponse<>(true, "Orders retrieved successfully", orders);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all orders", description = "Get paginated list of all orders (Admin only)")
    public ResponseEntity<ApiResponse<PagedResponse<OrderSummaryResponse>>> getAllOrders(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(defaultValue = "desc") String sortDir,
            @Parameter(description = "Filter by order status") @RequestParam(required = false) OrderStatus status,
            @Parameter(description = "Filter by payment status") @RequestParam(required = false) PaymentStatus paymentStatus) {
        
        PagedResponse<OrderSummaryResponse> orders = orderService.getAllOrders(page, size, sortBy, sortDir, status, paymentStatus);
        ApiResponse<PagedResponse<OrderSummaryResponse>> response = new ApiResponse<>(true, "Orders retrieved successfully", orders);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get order by ID", description = "Get detailed order information by ID")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        OrderResponse order = orderService.getOrderById(id, userPrincipal);
        ApiResponse<OrderResponse> response = new ApiResponse<>(true, "Order retrieved successfully", order);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/tracking/{trackingNumber}")
    @Operation(summary = "Get order by tracking number", description = "Get order information by tracking number")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderByTrackingNumber(
            @PathVariable String trackingNumber,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        OrderResponse order = orderService.getOrderByTrackingNumber(trackingNumber, userPrincipal);
        ApiResponse<OrderResponse> response = new ApiResponse<>(true, "Order retrieved successfully", order);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update order status", description = "Update order status and tracking information (Admin only)")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        OrderResponse order = orderService.updateOrderStatus(id, request);
        ApiResponse<OrderResponse> response = new ApiResponse<>(true, "Order status updated successfully", order);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}/cancel")
    @Operation(summary = "Cancel order", description = "Cancel an order (only allowed for PENDING or CONFIRMED orders)")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        OrderResponse order = orderService.cancelOrder(id, userPrincipal);
        ApiResponse<OrderResponse> response = new ApiResponse<>(true, "Order canceled successfully", order);
        return ResponseEntity.ok(response);
    }
}