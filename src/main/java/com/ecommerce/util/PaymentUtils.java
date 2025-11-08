package com.ecommerce.util;

import com.ecommerce.entity.PaymentMethod;
import io.micrometer.common.util.StringUtils;
import lombok.experimental.UtilityClass;
import lombok.extern.java.Log;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.TreeMap;
import java.util.UUID;
import java.util.logging.Level;

@Log
@UtilityClass
public class PaymentUtils {

    private static final String HMAC_SHA256 = "HmacSHA256";
    private static final String HMAC_SHA512 = "HmacSHA512";

    /**
     * Generate unique transaction ID
     */
    public static String generateTransactionId(PaymentMethod paymentMethod) {
        return "TXN_" + paymentMethod.name() + "_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
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
    public static String createVNPaySignature(Map<String, String> vnpParams, String secretKey) {
        var fieldNames = vnpParams.keySet().stream().sorted().toList();
        var hashData = new StringBuilder();
        var itr = fieldNames.iterator();
        while (itr.hasNext()) {
            var fieldName = itr.next();
            var fieldValue = vnpParams.get(fieldName);
            if (StringUtils.isNotBlank(fieldValue)) {
                //Build hash data
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                if (itr.hasNext()) {
                    hashData.append('&');
                }
            }
        }
        return hmacSHA512(secretKey, hashData.toString());
    }

    public String hmacSHA512(final String key, final String data) {
        try {
            if (key == null || data == null) {
                throw new NullPointerException();
            }
            final var hmac512 = Mac.getInstance(HMAC_SHA512);
            var hmacKeyBytes = key.getBytes();
            final SecretKeySpec secretKey = new SecretKeySpec(hmacKeyBytes, HMAC_SHA512);
            hmac512.init(secretKey);
            var dataBytes = data.getBytes(StandardCharsets.UTF_8);
            var result = hmac512.doFinal(dataBytes);
            var sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (Exception ignored) {
            return "";
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
            if (!query.isEmpty()) {
                query.append("&");
            }
            query.append(URLEncoder.encode(entry.getKey(), StandardCharsets.US_ASCII)).append("=").append(URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII));
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
    public static boolean validateVNPaySignature(Map<String, String> vnpParams, String signature, String secretKey) {
        String expectedSignature = createVNPaySignature(vnpParams, secretKey);
        return expectedSignature.equalsIgnoreCase(signature);
    }

    /**
     * ✅ Validate VNPay signature (the `vnp_SecureHash` parameter)
     *
     * @param params     all query parameters returned by VNPay (from request)
     * @param secretKey  your VNPay secret key
     * @return true if signature is valid, false otherwise
     */
    public static boolean validateVNPaySignature(Map<String, String> params, String secretKey) {
        if (params == null || params.isEmpty() || secretKey == null) {
            return false;
        }

        try {
            // 1️⃣ Lấy chữ ký VNPay gửi về
            String vnpSecureHash = params.get("vnp_SecureHash");
            if (vnpSecureHash == null || vnpSecureHash.isBlank()) {
                return false;
            }

            // 2️⃣ Loại bỏ vnp_SecureHash và vnp_SecureHashType khỏi danh sách
            Map<String, String> filteredParams = new TreeMap<>();
            for (Map.Entry<String, String> entry : params.entrySet()) {
                String key = entry.getKey();
                if (!key.equalsIgnoreCase("vnp_SecureHash") &&
                        !key.equalsIgnoreCase("vnp_SecureHashType") &&
                        entry.getValue() != null && !entry.getValue().isBlank()) {
                    filteredParams.put(key, entry.getValue());
                }
            }

            // 3️⃣ Nối lại thành chuỗi "key=value&key=value" (URL-encode từng phần)
            StringBuilder data = new StringBuilder();
            for (Map.Entry<String, String> entry : filteredParams.entrySet()) {
                if (!data.isEmpty()) data.append('&');
                data.append(URLEncoder.encode(entry.getKey(), StandardCharsets.US_ASCII))
                        .append('=')
                        .append(URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII));
            }
            // 4️⃣ Hash bằng HMAC SHA512
            String computedHash = hmacSHA512(secretKey, data.toString());
            // 5️⃣ So sánh chữ ký (không phân biệt hoa/thường)
            return computedHash.equalsIgnoreCase(vnpSecureHash);
        } catch (Exception e) {
            log.log(Level.INFO, "Failed to validate VNPay Signature", e);
            return false;
        }
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
        var info = String.format("Payment for order #%d by %s", orderId,
                customerName != null ? customerName : "Customer");
        return URLEncoder.encode(info, StandardCharsets.US_ASCII);
    }
}