package com.ecommerce.service;

import com.ecommerce.dto.payment.PaymentRequest;
import com.ecommerce.dto.payment.PaymentResponse;
import com.ecommerce.entity.PaymentMethod;

/**
 * Service interface for payment processing operations.
 * Provides abstraction for different payment gateway integrations.
 */
public interface PaymentService {
    
    /**
     * Process payment for an order.
     * 
     * @param request Payment request with order and payment details
     * @return Payment response with transaction information
     */
    PaymentResponse processPayment(PaymentRequest request);
    
    /**
     * Verify payment status from payment gateway.
     * 
     * @param transactionId Transaction ID from payment gateway
     * @param paymentMethod Payment method used
     * @return Payment verification response
     */
    PaymentResponse verifyPayment(String transactionId, PaymentMethod paymentMethod);
    
    /**
     * Refund a payment.
     * 
     * @param transactionId Original transaction ID
     * @param amount Amount to refund
     * @param paymentMethod Payment method used
     * @return Refund response
     */
    PaymentResponse refundPayment(String transactionId, java.math.BigDecimal amount, PaymentMethod paymentMethod);
    
    /**
     * Check if payment method is supported.
     * 
     * @param paymentMethod Payment method to check
     * @return true if supported, false otherwise
     */
    boolean isPaymentMethodSupported(PaymentMethod paymentMethod);
}