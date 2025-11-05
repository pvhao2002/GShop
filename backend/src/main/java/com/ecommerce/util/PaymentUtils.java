package com.ecommerce.util;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.TreeMap;
import java.util.UUID;

public class PaymentUtils {
    
    private static final String HMAC_SHA256 = "HmacSHA256";
    private static final String HMAC_SHA512 = "HmacSHA512";
    
    /**
     * Generate unique transaction ID
     */
    public static String generateTransactionId() {
        return "TXN_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
    
    /**
     * Generate MoMo request ID
     */
    public static String generateMoMoRequestId() {
        return "MOMO_" + System.currentTimeMillis();
    }
    
    /**
     * Generate VNPay transaction reference
     */
    public static String generateVNPayTxnRef() {
        return "VNPAY_" + System.currentTimeMillis();
    }
    
    /**
     * Create HMAC SHA256 signature for MoMo
     */
    public static String createMoMoSignature(String data, String secretKey) {
        try {
            Mac mac = Mac.getInstance(HMAC_SHA256);
            SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), HMAC_SHA256);
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(hash);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new RuntimeException("Error creating MoMo signature", e);
        }
    }
    
    /**
     * Create HMAC SHA512 signature for VNPay
     */
    public static String createVNPaySignature(String data, String secretKey) {
        try {
            Mac mac = Mac.getInstance(HMAC_SHA512);
            SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), HMAC_SHA512);
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(hash);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new RuntimeException("Error creating VNPay signature", e);
        }
    }
    
    /**
     * Convert byte array to hex string
     */
    private static String bytesToHex(byte[] bytes) {
        StringBuilder result = new StringBuilder();
        for (byte b : bytes) {
            result.append(String.format("%02x", b));
        }
        return result.toString();
    }
    
    /**
     * Create query string from parameters for VNPay
     */
    public static String createQueryString(Map<String, String> params) {
        // Sort parameters by key
        Map<String, String> sortedParams = new TreeMap<>(params);
        
        StringBuilder query = new StringBuilder();
        for (Map.Entry<String, String> entry : sortedParams.entrySet()) {
            if (query.length() > 0) {
                query.append("&");
            }
            query.append(entry.getKey()).append("=").append(entry.getValue());
        }
        return query.toString();
    }
    
    /**
     * Format amount for payment gateways (remove decimal places)
     */
    public static long formatAmountForGateway(java.math.BigDecimal amount) {
        return amount.multiply(java.math.BigDecimal.valueOf(100)).longValue();
    }
    
    /**
     * Get current timestamp in VNPay format
     */
    public static String getVNPayTimestamp() {
        return LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
    }
    
    /**
     * Get expiry time for VNPay (15 minutes from now)
     */
    public static String getVNPayExpireDate() {
        return LocalDateTime.now().plusMinutes(15).format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
    }
    
    /**
     * Validate MoMo signature
     */
    public static boolean validateMoMoSignature(String data, String signature, String secretKey) {
        String expectedSignature = createMoMoSignature(data, secretKey);
        return expectedSignature.equals(signature);
    }
    
    /**
     * Validate VNPay signature
     */
    public static boolean validateVNPaySignature(String data, String signature, String secretKey) {
        String expectedSignature = createVNPaySignature(data, secretKey);
        return expectedSignature.equalsIgnoreCase(signature);
    }
    
    /**
     * Sanitize order info for payment gateways
     */
    public static String sanitizeOrderInfo(String orderInfo) {
        if (orderInfo == null) {
            return "Payment for order";
        }
        // Remove special characters that might cause issues
        return orderInfo.replaceAll("[^a-zA-Z0-9\\s\\-_]", "").trim();
    }
    
    /**
     * Generate order description
     */
    public static String generateOrderDescription(Long orderId, String customerName) {
        return String.format("Payment for order #%d by %s", orderId, 
                customerName != null ? customerName : "Customer");
    }
}