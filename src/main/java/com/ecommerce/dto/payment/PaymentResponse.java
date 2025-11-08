package com.ecommerce.dto.payment;

import com.ecommerce.entity.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Response DTO for payment processing.
 * Contains transaction information and payment gateway response.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponse {
    private String transactionId;
    private PaymentStatus status;
    private PaymentMethod paymentMethod;
    private BigDecimal amount;
    private String gatewayResponse;
    private String errorMessage;
    private LocalDateTime processedAt;
    private Long id;
    private Long orderId;
    private String gatewayTransactionId;
    private String failureReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Payment gateway specific fields
    private String paymentUrl; // For MoMo and VNPay redirects
    private String qrCode; // For QR code payments

    /**
     * Payment status enum.
     */
    public enum PaymentStatus {
        PENDING,
        SUCCESS,
        FAILED,
        CANCELLED,
        REFUNDED
    }
}