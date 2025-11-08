package com.ecommerce.service.impl;

import ch.qos.logback.core.util.StringUtil;
import com.ecommerce.config.PaymentConfig;
import com.ecommerce.dto.payment.PaymentRequest;
import com.ecommerce.dto.payment.PaymentResponse;
import com.ecommerce.entity.Order;
import com.ecommerce.entity.OrderStatus;
import com.ecommerce.entity.PaymentMethod;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.service.PaymentService;
import com.ecommerce.util.PaymentUtils;
import com.ecommerce.exception.PaymentException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Implementation of PaymentService for payment processing operations.
 * Currently provides mock implementation for future payment gateway integration.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {
    private final OrderRepository orderRepository;
    private final PaymentConfig.VNPayConfig vnPayConfig;

    public String getSerectKey() {
        return vnPayConfig.getHashSecret();
    }


    @Override
    public PaymentResponse processPayment(PaymentRequest request) {
        log.info("Processing payment for order: {} with method: {}",
                request.getOrderId(), request.getPaymentMethod());
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + request.getOrderId()));
        // Validate payment amount matches order total
        if (request.getAmount().compareTo(order.getTotal()) != 0) {
            throw new PaymentException("Payment amount does not match order total");
        }

        return switch (request.getPaymentMethod()) {
            case VNPAY -> processVNPayPayment(request, order);
            case MOMO -> processMoMoPayment(request);
            default -> PaymentResponse.builder()
                    .status(PaymentResponse.PaymentStatus.FAILED)
                    .paymentMethod(request.getPaymentMethod())
                    .amount(request.getAmount())
                    .errorMessage("Unsupported payment method")
                    .processedAt(LocalDateTime.now())
                    .build();
        };
    }

    @Override
    public Order updatePayment(String txnRef, OrderStatus status) {
        var o = orderRepository.findByTrackingNumber(txnRef);
        o.ifPresent(order -> {
            order.setStatus(status);
            orderRepository.save(order);
        });
        return o.orElseThrow(() -> new PaymentException("Order not found with ref: " + txnRef));
    }

    @Override
    public Order updatePayment(Long id, OrderStatus status) {
        var o = orderRepository.findById(id);
        o.ifPresent(order -> {
            order.setStatus(status);
            orderRepository.save(order);
        });
        return o.orElseThrow(() -> new PaymentException("Order not found with id: " + id));
    }

    @Override
    public PaymentResponse verifyPayment(String transactionId, PaymentMethod paymentMethod) {

        return PaymentResponse.builder()
                .transactionId(transactionId)
                .status(PaymentResponse.PaymentStatus.SUCCESS)
                .paymentMethod(paymentMethod)
                .processedAt(LocalDateTime.now())
                .build();
    }

    @Override
    public PaymentResponse refundPayment(String transactionId, BigDecimal amount, PaymentMethod paymentMethod) {
        log.info("Refunding payment: {} amount: {} with method: {}",
                transactionId, amount, paymentMethod);

        // Mock implementation - in real scenario, process refund with actual payment gateways
        return PaymentResponse.builder()
                .transactionId(transactionId + "_REFUND")
                .status(PaymentResponse.PaymentStatus.REFUNDED)
                .paymentMethod(paymentMethod)
                .amount(amount)
                .processedAt(LocalDateTime.now())
                .build();
    }

    @Override
    public boolean isPaymentMethodSupported(PaymentMethod paymentMethod) {
        return paymentMethod == PaymentMethod.VNPAY ||
                paymentMethod == PaymentMethod.MOMO ||
                paymentMethod == PaymentMethod.COD;
    }

    private PaymentResponse processVNPayPayment(PaymentRequest request, Order order) {
        try {
            long amount = PaymentUtils.formatAmountForGateway(request.getAmount());
            String orderInfo = PaymentUtils.generateOrderDescription(order.getId(), order.getPhone());

            // Create VNPay parameters
            Map<String, String> vnpParams = new HashMap<>();
            vnpParams.put("vnp_Version", vnPayConfig.getVersion());
            vnpParams.put("vnp_Command", vnPayConfig.getCommand());
            vnpParams.put("vnp_TmnCode", vnPayConfig.getTmnCode());
            vnpParams.put("vnp_Amount", String.valueOf(amount));
            vnpParams.put("vnp_CurrCode", "VND");
            vnpParams.put("vnp_TxnRef", order.getTrackingNumber());
            vnpParams.put("vnp_OrderInfo", orderInfo);
            vnpParams.put("vnp_OrderType", vnPayConfig.getOrderType());
            vnpParams.put("vnp_Locale", "vn");
            vnpParams.put("vnp_ReturnUrl", StringUtil.notNullNorEmpty(request.getReturnUrl()) ? request.getReturnUrl() : vnPayConfig.getReturnUrl());
            vnpParams.put("vnp_IpAddr", "127.0.0.1");
            vnpParams.put("vnp_CreateDate", PaymentUtils.getVNPayTimestamp());
            vnpParams.put("vnp_ExpireDate", PaymentUtils.getVNPayExpireDate());
            // Create signature
            String queryString = PaymentUtils.createQueryString(vnpParams);
            String signature = PaymentUtils.createVNPaySignature(vnpParams, vnPayConfig.getHashSecret());
            // Build payment URL
            String paymentUrl = vnPayConfig.getUrl() + "?" + queryString + "&vnp_SecureHash=" + signature;
            PaymentResponse paymentResponse = new PaymentResponse();
            paymentResponse.setOrderId(order.getId());
            paymentResponse.setTransactionId(order.getTrackingNumber());
            paymentResponse.setPaymentMethod(PaymentMethod.VNPAY);
            paymentResponse.setStatus(PaymentResponse.PaymentStatus.PENDING);
            paymentResponse.setAmount(request.getAmount());
            paymentResponse.setPaymentUrl(paymentUrl);
            paymentResponse.setGatewayTransactionId(order.getTrackingNumber());
            paymentResponse.setCreatedAt(LocalDateTime.now());
            return paymentResponse;
        } catch (Exception e) {
            throw new PaymentException("Failed to process VNPay payment: " + e.getMessage());
        }
    }

    /**
     * Mock MoMo payment processing.
     */
    private PaymentResponse processMoMoPayment(PaymentRequest request) {
        String mockTransactionId = "MOMO_" + System.currentTimeMillis();
        String mockPaymentUrl = "https://test-payment.momo.vn/pay/" + mockTransactionId;

        return PaymentResponse.builder()
                .transactionId(mockTransactionId)
                .status(PaymentResponse.PaymentStatus.PENDING)
                .paymentMethod(PaymentMethod.MOMO)
                .amount(request.getAmount())
                .paymentUrl(mockPaymentUrl)
                .gatewayResponse("MoMo payment initiated")
                .processedAt(LocalDateTime.now())
                .build();
    }

    /**
     * Process Cash on Delivery payment.
     */
    private PaymentResponse processCODPayment(PaymentRequest request) {
        // COD doesn't require online payment processing
        String mockTransactionId = "COD_" + System.currentTimeMillis();

        return PaymentResponse.builder()
                .transactionId(mockTransactionId)
                .status(PaymentResponse.PaymentStatus.SUCCESS)
                .paymentMethod(PaymentMethod.COD)
                .amount(request.getAmount())
                .gatewayResponse("Cash on Delivery confirmed")
                .processedAt(LocalDateTime.now())
                .build();
    }
}