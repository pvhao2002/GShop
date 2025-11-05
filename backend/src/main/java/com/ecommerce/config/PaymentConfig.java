package com.ecommerce.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
public class PaymentConfig {
    
    @Configuration
    @ConfigurationProperties(prefix = "payment.momo")
    public static class MoMoConfig {
        private String partnerCode;
        private String accessKey;
        private String secretKey;
        private String endpoint;
        private String returnUrl;
        private String notifyUrl;
        
        // Getters and Setters
        public String getPartnerCode() {
            return partnerCode;
        }
        
        public void setPartnerCode(String partnerCode) {
            this.partnerCode = partnerCode;
        }
        
        public String getAccessKey() {
            return accessKey;
        }
        
        public void setAccessKey(String accessKey) {
            this.accessKey = accessKey;
        }
        
        public String getSecretKey() {
            return secretKey;
        }
        
        public void setSecretKey(String secretKey) {
            this.secretKey = secretKey;
        }
        
        public String getEndpoint() {
            return endpoint;
        }
        
        public void setEndpoint(String endpoint) {
            this.endpoint = endpoint;
        }
        
        public String getReturnUrl() {
            return returnUrl;
        }
        
        public void setReturnUrl(String returnUrl) {
            this.returnUrl = returnUrl;
        }
        
        public String getNotifyUrl() {
            return notifyUrl;
        }
        
        public void setNotifyUrl(String notifyUrl) {
            this.notifyUrl = notifyUrl;
        }
    }
    
    @Configuration
    @ConfigurationProperties(prefix = "payment.vnpay")
    public static class VNPayConfig {
        private String tmnCode;
        private String hashSecret;
        private String url;
        private String returnUrl;
        private String version;
        private String command;
        private String orderType;
        
        // Getters and Setters
        public String getTmnCode() {
            return tmnCode;
        }
        
        public void setTmnCode(String tmnCode) {
            this.tmnCode = tmnCode;
        }
        
        public String getHashSecret() {
            return hashSecret;
        }
        
        public void setHashSecret(String hashSecret) {
            this.hashSecret = hashSecret;
        }
        
        public String getUrl() {
            return url;
        }
        
        public void setUrl(String url) {
            this.url = url;
        }
        
        public String getReturnUrl() {
            return returnUrl;
        }
        
        public void setReturnUrl(String returnUrl) {
            this.returnUrl = returnUrl;
        }
        
        public String getVersion() {
            return version;
        }
        
        public void setVersion(String version) {
            this.version = version;
        }
        
        public String getCommand() {
            return command;
        }
        
        public void setCommand(String command) {
            this.command = command;
        }
        
        public String getOrderType() {
            return orderType;
        }
        
        public void setOrderType(String orderType) {
            this.orderType = orderType;
        }
    }
}