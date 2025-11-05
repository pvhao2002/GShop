package com.ecommerce.controller;

import com.ecommerce.dto.request.PaymentRequest;
import com.ecommerce.dto.response.ApiResponse;
import com.ecommerce.dto.response.PaymentResponse;
import com.ecommerce.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/payment")
@Tag(name = "Payment Processing", description = "Payment gateway integration for COD, MoMo, and VNPay payment methods")
public class PaymentController {
    
    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);
    
    @Autowired
    private PaymentService paymentService;
    
    @PostMapping("/process")
    @Operation(
        summary = "Process payment",
        description = """
            Process payment for an order using the specified payment method.
            
            **Supported Payment Methods:**
            - **COD (Cash on Delivery):** Payment collected upon delivery
            - **MoMo:** Vietnamese mobile wallet payment
            - **VNPay:** Vietnamese online payment gateway
            
            **Payment Flow:**
            1. Validate order and payment details
            2. Initialize payment with selected gateway
            3. Return payment URL for online methods or confirmation for COD
            4. Handle payment notifications via webhooks
            """,
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Payment processing request",
            required = true,
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = PaymentRequest.class),
                examples = {
                    @ExampleObject(
                        name = "COD Payment",
                        summary = "Cash on Delivery payment",
                        value = """
                            {
                              "orderId": 1,
                              "paymentMethod": "COD",
                              "amount": 89.97
                            }
                            """
                    ),
                    @ExampleObject(
                        name = "MoMo Payment",
                        summary = "MoMo wallet payment",
                        value = """
                            {
                              "orderId": 1,
                              "paymentMethod": "MOMO",
                              "amount": 89.97,
                              "returnUrl": "https://yourapp.com/payment/return"
                            }
                            """
                    ),
                    @ExampleObject(
                        name = "VNPay Payment",
                        summary = "VNPay gateway payment",
                        value = """
                            {
                              "orderId": 1,
                              "paymentMethod": "VNPAY",
                              "amount": 89.97,
                              "returnUrl": "https://yourapp.com/payment/return"
                            }
                            """
                    )
                }
            )
        )
    )
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Payment processed successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ApiResponse.class),
                examples = {
                    @ExampleObject(
                        name = "COD Payment Response",
                        summary = "COD payment confirmation",
                        value = """
                            {
                              "success": true,
                              "message": "Payment processed successfully",
                              "data": {
                                "transactionId": "COD-2024-001",
                                "status": "PENDING",
                                "paymentMethod": "COD",
                                "amount": 89.97,
                                "orderId": 1,
                                "paymentUrl": null,
                                "createdAt": "2024-01-15T10:30:00Z"
                              }
                            }
                            """
                    ),
                    @ExampleObject(
                        name = "Online Payment Response",
                        summary = "MoMo/VNPay payment with redirect URL",
                        value = """
                            {
                              "success": true,
                              "message": "Payment processed successfully",
                              "data": {
                                "transactionId": "MOMO-2024-001",
                                "status": "PENDING",
                                "paymentMethod": "MOMO",
                                "amount": 89.97,
                                "orderId": 1,
                                "paymentUrl": "https://payment.momo.vn/pay?token=abc123",
                                "createdAt": "2024-01-15T10:30:00Z"
                              }
                            }
                            """
                    )
                }
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", ref = "#/components/responses/ValidationError"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", ref = "#/components/responses/UnauthorizedError"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", ref = "#/components/responses/NotFoundError")
    })
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PaymentResponse>> processPayment(
            @Valid @RequestBody PaymentRequest request) {
        
        logger.info("Processing payment request for order: {} with method: {}", 
                request.getOrderId(), request.getPaymentMethod());
        
        PaymentResponse response = paymentService.processPayment(request);
        
        return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Payment processed successfully",
                response
        ));
    }
    
    @GetMapping("/status/{orderId}")
    @Operation(
        summary = "Get payment status",
        description = "Get payment status for a specific order"
    )
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentStatus(
            @Parameter(description = "Order ID") @PathVariable Long orderId) {
        
        logger.info("Getting payment status for order: {}", orderId);
        
        PaymentResponse response = paymentService.getPaymentStatusByOrderId(orderId);
        
        return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Payment status retrieved successfully",
                response
        ));
    }
    
    @GetMapping("/transaction/{transactionId}")
    @Operation(
        summary = "Get payment by transaction ID",
        description = "Get payment details by transaction ID"
    )
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentByTransactionId(
            @Parameter(description = "Transaction ID") @PathVariable String transactionId) {
        
        logger.info("Getting payment by transaction ID: {}", transactionId);
        
        PaymentResponse response = paymentService.getPaymentByTransactionId(transactionId);
        
        return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Payment retrieved successfully",
                response
        ));
    }
    
    @PostMapping("/momo/notify")
    @Operation(
        summary = "MoMo payment notification webhook",
        description = "Handle payment notification from MoMo gateway"
    )
    public ResponseEntity<String> handleMoMoNotification(@RequestBody Map<String, Object> notification) {
        
        logger.info("Received MoMo notification: {}", notification);
        
        try {
            paymentService.handleMoMoNotification(notification);
            return ResponseEntity.ok("OK");
        } catch (Exception e) {
            logger.error("Error handling MoMo notification", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("ERROR");
        }
    }
    
    @GetMapping("/vnpay/return")
    @Operation(
        summary = "VNPay payment return",
        description = "Handle payment return from VNPay gateway"
    )
    public ResponseEntity<ApiResponse<String>> handleVNPayReturn(@RequestParam Map<String, String> params) {
        
        logger.info("Received VNPay return: {}", params);
        
        try {
            paymentService.handleVNPayReturn(params);
            
            String responseCode = params.get("vnp_ResponseCode");
            if ("00".equals(responseCode)) {
                return ResponseEntity.ok(new ApiResponse<>(
                        true,
                        "Payment completed successfully",
                        "SUCCESS"
                ));
            } else {
                return ResponseEntity.ok(new ApiResponse<>(
                        false,
                        "Payment failed",
                        "FAILED"
                ));
            }
        } catch (Exception e) {
            logger.error("Error handling VNPay return", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Error processing payment return", "ERROR"));
        }
    }
    
    @PostMapping("/cod/confirm/{orderId}")
    @Operation(
        summary = "Confirm COD payment",
        description = "Confirm Cash on Delivery payment when order is delivered (Admin only)"
    )
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> confirmCODPayment(
            @Parameter(description = "Order ID") @PathVariable Long orderId) {
        
        logger.info("Confirming COD payment for order: {}", orderId);
        
        paymentService.confirmCODPayment(orderId);
        
        return ResponseEntity.ok(new ApiResponse<>(
                true,
                "COD payment confirmed successfully",
                "CONFIRMED"
        ));
    }
    
    @PostMapping("/cod")
    @Operation(
        summary = "Process COD payment",
        description = "Process Cash on Delivery payment"
    )
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PaymentResponse>> processCODPayment(
            @Valid @RequestBody PaymentRequest request) {
        
        // Ensure payment method is COD
        request.setPaymentMethod(com.ecommerce.entity.PaymentMethod.COD);
        
        logger.info("Processing COD payment for order: {}", request.getOrderId());
        
        PaymentResponse response = paymentService.processPayment(request);
        
        return ResponseEntity.ok(new ApiResponse<>(
                true,
                "COD payment processed successfully",
                response
        ));
    }
    
    @PostMapping("/momo")
    @Operation(
        summary = "Process MoMo payment",
        description = "Process MoMo wallet payment"
    )
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PaymentResponse>> processMoMoPayment(
            @Valid @RequestBody PaymentRequest request) {
        
        // Ensure payment method is MoMo
        request.setPaymentMethod(com.ecommerce.entity.PaymentMethod.MOMO);
        
        logger.info("Processing MoMo payment for order: {}", request.getOrderId());
        
        PaymentResponse response = paymentService.processPayment(request);
        
        return ResponseEntity.ok(new ApiResponse<>(
                true,
                "MoMo payment initiated successfully",
                response
        ));
    }
    
    @PostMapping("/vnpay")
    @Operation(
        summary = "Process VNPay payment",
        description = "Process VNPay payment"
    )
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PaymentResponse>> processVNPayPayment(
            @Valid @RequestBody PaymentRequest request) {
        
        // Ensure payment method is VNPay
        request.setPaymentMethod(com.ecommerce.entity.PaymentMethod.VNPAY);
        
        logger.info("Processing VNPay payment for order: {}", request.getOrderId());
        
        PaymentResponse response = paymentService.processPayment(request);
        
        return ResponseEntity.ok(new ApiResponse<>(
                true,
                "VNPay payment initiated successfully",
                response
        ));
    }
}