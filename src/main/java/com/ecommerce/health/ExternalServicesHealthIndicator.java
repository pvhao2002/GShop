package com.ecommerce.health;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.actuator.health.Health;
import org.springframework.boot.actuator.health.HealthIndicator;
import org.springframework.stereotype.Component;

import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;

/**
 * Custom health indicator for external services like payment gateways.
 * Checks connectivity and response times for external dependencies.
 */
@Component
@Slf4j
public class ExternalServicesHealthIndicator implements HealthIndicator {

    private static final int TIMEOUT_MS = 5000;
    private static final Map<String, String> EXTERNAL_SERVICES = Map.of(
        "VNPay", "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
        "MoMo", "https://test-payment.momo.vn/v2/gateway/api/create",
        "EmailService", "https://api.sendgrid.com/v3/mail/send"
    );

    @Override
    public Health health() {
        Map<String, Object> serviceStatuses = new HashMap<>();
        boolean allServicesUp = true;
        long totalResponseTime = 0;
        int checkedServices = 0;

        for (Map.Entry<String, String> service : EXTERNAL_SERVICES.entrySet()) {
            String serviceName = service.getKey();
            String serviceUrl = service.getValue();
            
            try {
                ServiceHealthStatus status = checkServiceHealth(serviceUrl);
                serviceStatuses.put(serviceName, Map.of(
                    "status", status.isUp() ? "UP" : "DOWN",
                    "responseTime", status.getResponseTime() + "ms",
                    "url", serviceUrl
                ));
                
                if (!status.isUp()) {
                    allServicesUp = false;
                } else {
                    totalResponseTime += status.getResponseTime();
                    checkedServices++;
                }
                
            } catch (Exception e) {
                log.warn("Health check failed for service {}: {}", serviceName, e.getMessage());
                serviceStatuses.put(serviceName, Map.of(
                    "status", "DOWN",
                    "error", e.getMessage(),
                    "url", serviceUrl
                ));
                allServicesUp = false;
            }
        }

        Health.Builder healthBuilder = allServicesUp ? Health.up() : Health.down();
        
        healthBuilder.withDetail("services", serviceStatuses);
        
        if (checkedServices > 0) {
            long averageResponseTime = totalResponseTime / checkedServices;
            healthBuilder.withDetail("averageResponseTime", averageResponseTime + "ms");
        }
        
        healthBuilder.withDetail("totalServices", EXTERNAL_SERVICES.size());
        healthBuilder.withDetail("servicesUp", checkedServices);
        healthBuilder.withDetail("servicesDown", EXTERNAL_SERVICES.size() - checkedServices);

        return healthBuilder.build();
    }

    private ServiceHealthStatus checkServiceHealth(String serviceUrl) {
        long startTime = System.currentTimeMillis();
        
        try {
            URL url = new URL(serviceUrl);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("HEAD");
            connection.setConnectTimeout(TIMEOUT_MS);
            connection.setReadTimeout(TIMEOUT_MS);
            connection.setRequestProperty("User-Agent", "EcommerceAPI-HealthCheck/1.0");
            
            int responseCode = connection.getResponseCode();
            long responseTime = System.currentTimeMillis() - startTime;
            
            // Consider 2xx and 3xx as healthy, 4xx might be expected for some services
            boolean isUp = responseCode < 500;
            
            return new ServiceHealthStatus(isUp, responseTime, responseCode);
            
        } catch (Exception e) {
            long responseTime = System.currentTimeMillis() - startTime;
            log.debug("Service health check failed for {}: {}", serviceUrl, e.getMessage());
            return new ServiceHealthStatus(false, responseTime, -1);
        }
    }

    private static class ServiceHealthStatus {
        private final boolean up;
        private final long responseTime;
        private final int httpStatus;

        public ServiceHealthStatus(boolean up, long responseTime, int httpStatus) {
            this.up = up;
            this.responseTime = responseTime;
            this.httpStatus = httpStatus;
        }

        public boolean isUp() {
            return up;
        }

        public long getResponseTime() {
            return responseTime;
        }

        public int getHttpStatus() {
            return httpStatus;
        }
    }
}