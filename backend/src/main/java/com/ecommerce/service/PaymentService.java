package com.ecommerce.service;

import com.ecommerce.config.PaymentConfig;
import com.ecommerce.dto.request.PaymentRequest;
import com.ecommerce.dto.response.PaymentResponse;
import com.ecommerce.entity.*;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.exception.PaymentException;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.PaymentRepository;
import com.ecommerce.util.PaymentUtils;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
public class PaymentService {
    
    private static final Logger logger = LoggerFactory.getLogger(PaymentService.class);
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private PaymentConfig.MoMoConfig moMoConfig;
    
    @Autowired
    private PaymentConfig.VNPayConfig vnPayConfig;
    
    @Autowired
    private RestTemplate restTemplate;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    /**
     * Process payment based on payment method
     */
    public PaymentResponse processPayment(PaymentRequest request) {
        logger.info("Processing payment for order: {} with method: {}", request.getOrderId(), request.getPaymentMethod());
        
        // Validate order exists and belongs to current user
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + request.getOrderId()));
        
        // Validate payment amount matches order total
        if (request.getAmount().compareTo(order.getTotalAmount()) != 0) {
            throw new PaymentException("Payment amount does not match order total");
        }
        
        // Check if order already has a successful payment
        Optional<Payment> existingPayment = paymentRepository.findByOrderIdAndStatus(order.getId(), PaymentStatus.PAID);
        if (existingPayment.isPresent()) {
            throw new PaymentException("Order has already been paid");
        }
        
        // Create payment record
        Payment payment = new Payment(order, request.getPaymentMethod(), request.getAmount());
        payment.setTransactionId(PaymentUtils.generateTransactionId());
        
        // Process based on payment method
        PaymentResponse response;
        switch (request.getPaymentMethod()) {
            case COD:
                response = processCODPayment(payment);
                break;
            case MOMO:
                response = processMoMoPayment(payment, request);
                break;
            case VNPAY:
                response = processVNPayPayment(payment, request);
                break;
            default:
                throw new PaymentException("Unsupported payment method: " + request.getPaymentMethod());
        }
        
        // Save payment
        payment = paymentRepository.save(payment);
        response.setId(payment.getId());
        
        logger.info("Payment processed successfully. Transaction ID: {}", payment.getTransactionId());
        return response;
    }
    
    /**
     * Process Cash on Delivery payment
     */
    private PaymentResponse processCODPayment(Payment payment) {
        logger.info("Processing COD payment for order: {}", payment.getOrder().getId());
        
        // COD payments are marked as pending until delivery
        payment.setStatus(PaymentStatus.PENDING);
        payment.setProcessedAt(LocalDateTime.now());
        
        // Update order payment status
        Order order = payment.getOrder();
        order.setPaymentStatus(PaymentStatus.PENDING);
        order.setStatus(OrderStatus.CONFIRMED);
        orderRepository.save(order);
        
        PaymentResponse response = new PaymentResponse();
        response.setOrderId(order.getId());
        response.setTransactionId(payment.getTransactionId());
        response.setPaymentMethod(PaymentMethod.COD);
        response.setStatus(PaymentStatus.PENDING);
        response.setAmount(payment.getAmount());
        response.setCreatedAt(LocalDateTime.now());
        
        return response;
    }
    
    /**
     * Process MoMo payment
     */
    private PaymentResponse processMoMoPayment(Payment payment, PaymentRequest request) {
        logger.info("Processing MoMo payment for order: {}", payment.getOrder().getId());
        
        try {
            String requestId = PaymentUtils.generateMoMoRequestId();
            String orderId = payment.getTransactionId();
            String orderInfo = PaymentUtils.generateOrderDescription(payment.getOrder().getId(), 
                    payment.getOrder().getUser().getFirstName() + " " + payment.getOrder().getUser().getLastName());
            long amount = PaymentUtils.formatAmountForGateway(payment.getAmount());
            
            // Create MoMo request
            Map<String, Object> momoRequest = new HashMap<>();
            momoRequest.put("partnerCode", moMoConfig.getPartnerCode());
            momoRequest.put("requestId", requestId);
            momoRequest.put("amount", amount);
            momoRequest.put("orderId", orderId);
            momoRequest.put("orderInfo", orderInfo);
            momoRequest.put("redirectUrl", request.getReturnUrl() != null ? request.getReturnUrl() : moMoConfig.getReturnUrl());
            momoRequest.put("ipnUrl", moMoConfig.getNotifyUrl());
            momoRequest.put("requestType", "captureWallet");
            momoRequest.put("extraData", "");
            momoRequest.put("lang", "en");
            
            // Create signature
            String rawSignature = String.format("accessKey=%s&amount=%d&extraData=%s&ipnUrl=%s&orderId=%s&orderInfo=%s&partnerCode=%s&redirectUrl=%s&requestId=%s&requestType=%s",
                    moMoConfig.getAccessKey(), amount, "", moMoConfig.getNotifyUrl(), orderId, orderInfo,
                    moMoConfig.getPartnerCode(), momoRequest.get("redirectUrl"), requestId, "captureWallet");
            
            String signature = PaymentUtils.createMoMoSignature(rawSignature, moMoConfig.getSecretKey());
            momoRequest.put("signature", signature);
            
            // Send request to MoMo
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(momoRequest, headers);
            
            ResponseEntity<String> response = restTemplate.postForEntity(
                    moMoConfig.getEndpoint() + "/v2/gateway/api/create", entity, String.class);
            
            JsonNode responseJson = objectMapper.readTree(response.getBody());
            
            if (responseJson.get("resultCode").asInt() == 0) {
                String payUrl = responseJson.get("payUrl").asText();
                
                payment.setStatus(PaymentStatus.PENDING);
                payment.setGatewayResponse(response.getBody());
                
                PaymentResponse paymentResponse = new PaymentResponse();
                paymentResponse.setOrderId(payment.getOrder().getId());
                paymentResponse.setTransactionId(payment.getTransactionId());
                paymentResponse.setPaymentMethod(PaymentMethod.MOMO);
                paymentResponse.setStatus(PaymentStatus.PENDING);
                paymentResponse.setAmount(payment.getAmount());
                paymentResponse.setPaymentUrl(payUrl);
                paymentResponse.setCreatedAt(LocalDateTime.now());
                
                return paymentResponse;
            } else {
                throw new PaymentException("MoMo payment failed: " + responseJson.get("message").asText());
            }
            
        } catch (Exception e) {
            logger.error("Error processing MoMo payment", e);
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureReason(e.getMessage());
            throw new PaymentException("Failed to process MoMo payment: " + e.getMessage());
        }
    }
    
    /**
     * Process VNPay payment
     */
    private PaymentResponse processVNPayPayment(Payment payment, PaymentRequest request) {
        logger.info("Processing VNPay payment for order: {}", payment.getOrder().getId());
        
        try {
            String txnRef = PaymentUtils.generateVNPayTxnRef();
            long amount = PaymentUtils.formatAmountForGateway(payment.getAmount());
            String orderInfo = PaymentUtils.generateOrderDescription(payment.getOrder().getId(),
                    payment.getOrder().getUser().getFirstName() + " " + payment.getOrder().getUser().getLastName());
            
            // Create VNPay parameters
            Map<String, String> vnpParams = new HashMap<>();
            vnpParams.put("vnp_Version", vnPayConfig.getVersion());
            vnpParams.put("vnp_Command", vnPayConfig.getCommand());
            vnpParams.put("vnp_TmnCode", vnPayConfig.getTmnCode());
            vnpParams.put("vnp_Amount", String.valueOf(amount));
            vnpParams.put("vnp_CurrCode", "VND");
            vnpParams.put("vnp_TxnRef", txnRef);
            vnpParams.put("vnp_OrderInfo", orderInfo);
            vnpParams.put("vnp_OrderType", vnPayConfig.getOrderType());
            vnpParams.put("vnp_Locale", "vn");
            vnpParams.put("vnp_ReturnUrl", request.getReturnUrl() != null ? request.getReturnUrl() : vnPayConfig.getReturnUrl());
            vnpParams.put("vnp_IpAddr", "127.0.0.1");
            vnpParams.put("vnp_CreateDate", PaymentUtils.getVNPayTimestamp());
            vnpParams.put("vnp_ExpireDate", PaymentUtils.getVNPayExpireDate());
            
            // Create signature
            String queryString = PaymentUtils.createQueryString(vnpParams);
            String signature = PaymentUtils.createVNPaySignature(queryString, vnPayConfig.getHashSecret());
            
            // Build payment URL
            String paymentUrl = vnPayConfig.getUrl() + "?" + queryString + "&vnp_SecureHash=" + signature;
            
            payment.setStatus(PaymentStatus.PENDING);
            payment.setGatewayTransactionId(txnRef);
            
            PaymentResponse paymentResponse = new PaymentResponse();
            paymentResponse.setOrderId(payment.getOrder().getId());
            paymentResponse.setTransactionId(payment.getTransactionId());
            paymentResponse.setPaymentMethod(PaymentMethod.VNPAY);
            paymentResponse.setStatus(PaymentStatus.PENDING);
            paymentResponse.setAmount(payment.getAmount());
            paymentResponse.setPaymentUrl(paymentUrl);
            paymentResponse.setGatewayTransactionId(txnRef);
            paymentResponse.setCreatedAt(LocalDateTime.now());
            
            return paymentResponse;
            
        } catch (Exception e) {
            logger.error("Error processing VNPay payment", e);
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureReason(e.getMessage());
            throw new PaymentException("Failed to process VNPay payment: " + e.getMessage());
        }
    }
    
    /**
     * Handle MoMo payment notification (webhook)
     */
    public void handleMoMoNotification(Map<String, Object> notification) {
        logger.info("Handling MoMo notification: {}", notification);
        
        try {
            String orderId = (String) notification.get("orderId");
            Integer resultCode = (Integer) notification.get("resultCode");
            String transId = (String) notification.get("transId");
            
            Optional<Payment> paymentOpt = paymentRepository.findByTransactionId(orderId);
            if (paymentOpt.isPresent()) {
                Payment payment = paymentOpt.get();
                
                if (resultCode == 0) {
                    // Payment successful
                    payment.setStatus(PaymentStatus.PAID);
                    payment.setGatewayTransactionId(transId);
                    payment.setProcessedAt(LocalDateTime.now());
                    
                    // Update order status
                    Order order = payment.getOrder();
                    order.setPaymentStatus(PaymentStatus.PAID);
                    order.setStatus(OrderStatus.CONFIRMED);
                    orderRepository.save(order);
                    
                } else {
                    // Payment failed
                    payment.setStatus(PaymentStatus.FAILED);
                    payment.setFailureReason("MoMo payment failed with code: " + resultCode);
                }
                
                payment.setGatewayResponse(objectMapper.writeValueAsString(notification));
                paymentRepository.save(payment);
            }
            
        } catch (Exception e) {
            logger.error("Error handling MoMo notification", e);
        }
    }
    
    /**
     * Handle VNPay payment return
     */
    public void handleVNPayReturn(Map<String, String> params) {
        logger.info("Handling VNPay return: {}", params);
        
        try {
            String txnRef = params.get("vnp_TxnRef");
            String responseCode = params.get("vnp_ResponseCode");
            String transactionNo = params.get("vnp_TransactionNo");
            
            Optional<Payment> paymentOpt = paymentRepository.findByGatewayTransactionId(txnRef);
            if (paymentOpt.isPresent()) {
                Payment payment = paymentOpt.get();
                
                if ("00".equals(responseCode)) {
                    // Payment successful
                    payment.setStatus(PaymentStatus.PAID);
                    payment.setGatewayTransactionId(transactionNo);
                    payment.setProcessedAt(LocalDateTime.now());
                    
                    // Update order status
                    Order order = payment.getOrder();
                    order.setPaymentStatus(PaymentStatus.PAID);
                    order.setStatus(OrderStatus.CONFIRMED);
                    orderRepository.save(order);
                    
                } else {
                    // Payment failed
                    payment.setStatus(PaymentStatus.FAILED);
                    payment.setFailureReason("VNPay payment failed with code: " + responseCode);
                }
                
                payment.setGatewayResponse(objectMapper.writeValueAsString(params));
                paymentRepository.save(payment);
            }
            
        } catch (Exception e) {
            logger.error("Error handling VNPay return", e);
        }
    }
    
    /**
     * Get payment by transaction ID
     */
    public PaymentResponse getPaymentByTransactionId(String transactionId) {
        Payment payment = paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with transaction ID: " + transactionId));
        
        return convertToPaymentResponse(payment);
    }
    
    /**
     * Get payment status by order ID
     */
    public PaymentResponse getPaymentStatusByOrderId(Long orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId).stream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for order ID: " + orderId));
        
        return convertToPaymentResponse(payment);
    }
    
    /**
     * Confirm COD payment (when order is delivered)
     */
    public void confirmCODPayment(Long orderId) {
        Optional<Payment> paymentOpt = paymentRepository.findByOrderIdAndStatus(orderId, PaymentStatus.PENDING);
        if (paymentOpt.isPresent()) {
            Payment payment = paymentOpt.get();
            if (payment.getPaymentMethod() == PaymentMethod.COD) {
                payment.setStatus(PaymentStatus.PAID);
                payment.setProcessedAt(LocalDateTime.now());
                
                // Update order status
                Order order = payment.getOrder();
                order.setPaymentStatus(PaymentStatus.PAID);
                orderRepository.save(order);
                
                paymentRepository.save(payment);
                logger.info("COD payment confirmed for order: {}", orderId);
            }
        }
    }
    
    /**
     * Convert Payment entity to PaymentResponse DTO
     */
    private PaymentResponse convertToPaymentResponse(Payment payment) {
        PaymentResponse response = new PaymentResponse();
        response.setId(payment.getId());
        response.setOrderId(payment.getOrder().getId());
        response.setTransactionId(payment.getTransactionId());
        response.setPaymentMethod(payment.getPaymentMethod());
        response.setStatus(payment.getStatus());
        response.setAmount(payment.getAmount());
        response.setGatewayTransactionId(payment.getGatewayTransactionId());
        response.setFailureReason(payment.getFailureReason());
        response.setProcessedAt(payment.getProcessedAt());
        response.setCreatedAt(payment.getCreatedAt());
        response.setUpdatedAt(payment.getUpdatedAt());
        return response;
    }
}