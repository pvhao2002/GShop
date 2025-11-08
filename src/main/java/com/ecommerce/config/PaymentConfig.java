package com.ecommerce.config;

import com.ecommerce.util.NetworkUtils;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
public class PaymentConfig {

    @Data
    @Configuration
    @ConfigurationProperties(prefix = "payment.momo")
    public static class MoMoConfig {
        private String partnerCode;
        private String accessKey;
        private String secretKey;
        private String endpoint;
        private String returnUrl;
        private String notifyUrl;
    }

    @Data
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

        public String getReturnUrl() {
            if (returnUrl.contains("localhost")) {
                String ip = NetworkUtils.getLocalIpAddress();
                return returnUrl.replace("localhost", ip);
            }
            return returnUrl;
        }
    }
}