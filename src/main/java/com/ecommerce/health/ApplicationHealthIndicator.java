package com.ecommerce.health;

import com.ecommerce.repository.UserRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.MemoryUsage;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

/**
 * Custom health indicator for application-specific metrics and business logic health.
 * Monitors memory usage, data integrity, and application performance metrics.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ApplicationHealthIndicator implements HealthIndicator {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    private static final double MEMORY_WARNING_THRESHOLD = 0.8; // 80%
    private static final double MEMORY_CRITICAL_THRESHOLD = 0.9; // 90%

    @Override
    public Health health() {
        try {
            Health.Builder healthBuilder = Health.up();
            
            // Check memory usage
            MemoryStatus memoryStatus = checkMemoryUsage();
            healthBuilder.withDetail("memory", memoryStatus.getDetails());
            
            // Check data integrity
            DataIntegrityStatus dataStatus = checkDataIntegrity();
            healthBuilder.withDetail("dataIntegrity", dataStatus.getDetails());
            
            // Add application metrics
            healthBuilder.withDetail("applicationMetrics", getApplicationMetrics());
            
            // Add system information
            healthBuilder.withDetail("systemInfo", getSystemInfo());
            
            // Determine overall health status
            if (memoryStatus.isCritical() || !dataStatus.isHealthy()) {
                healthBuilder = Health.down();
            } else if (memoryStatus.hasWarning()) {
                healthBuilder.withDetail("warning", "Memory usage is high");
            }
            
            return healthBuilder.build();
            
        } catch (Exception e) {
            log.error("Application health check failed", e);
            return Health.down()
                    .withDetail("error", e.getMessage())
                    .withDetail("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                    .build();
        }
    }

    private MemoryStatus checkMemoryUsage() {
        MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
        MemoryUsage heapMemory = memoryBean.getHeapMemoryUsage();
        
        long used = heapMemory.getUsed();
        long max = heapMemory.getMax();
        double usageRatio = (double) used / max;
        
        boolean hasWarning = usageRatio > MEMORY_WARNING_THRESHOLD;
        boolean isCritical = usageRatio > MEMORY_CRITICAL_THRESHOLD;
        
        return new MemoryStatus(
            formatBytes(used),
            formatBytes(max),
            String.format("%.2f%%", usageRatio * 100),
            hasWarning,
            isCritical
        );
    }

    private DataIntegrityStatus checkDataIntegrity() {
        try {
            // Check if repositories are accessible and data is consistent
            long userCount = userRepository.count();
            long productCount = productRepository.count();
            long orderCount = orderRepository.count();
            
            // Basic sanity checks
            boolean isHealthy = userCount >= 0 && productCount >= 0 && orderCount >= 0;
            
            return new DataIntegrityStatus(
                isHealthy,
                userCount,
                productCount,
                orderCount
            );
            
        } catch (Exception e) {
            log.warn("Data integrity check failed: {}", e.getMessage());
            return new DataIntegrityStatus(false, -1, -1, -1);
        }
    }

    private Object getApplicationMetrics() {
        return Map.of(
            "uptime", getUptime(),
            "jvmVersion", System.getProperty("java.version"),
            "springBootVersion", getClass().getPackage().getImplementationVersion(),
            "activeProfiles", System.getProperty("spring.profiles.active", "default"),
            "timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
        );
    }

    private Object getSystemInfo() {
        Runtime runtime = Runtime.getRuntime();
        return Map.of(
            "availableProcessors", runtime.availableProcessors(),
            "totalMemory", formatBytes(runtime.totalMemory()),
            "freeMemory", formatBytes(runtime.freeMemory()),
            "maxMemory", formatBytes(runtime.maxMemory()),
            "osName", System.getProperty("os.name"),
            "osVersion", System.getProperty("os.version"),
            "javaVendor", System.getProperty("java.vendor")
        );
    }

    private String getUptime() {
        long uptimeMs = ManagementFactory.getRuntimeMXBean().getUptime();
        long seconds = uptimeMs / 1000;
        long minutes = seconds / 60;
        long hours = minutes / 60;
        long days = hours / 24;
        
        return String.format("%dd %dh %dm %ds", 
            days, hours % 24, minutes % 60, seconds % 60);
    }

    private String formatBytes(long bytes) {
        if (bytes < 1024) return bytes + " B";
        int exp = (int) (Math.log(bytes) / Math.log(1024));
        String pre = "KMGTPE".charAt(exp - 1) + "";
        return String.format("%.1f %sB", bytes / Math.pow(1024, exp), pre);
    }

    private static class MemoryStatus {
        private final String used;
        private final String max;
        private final String percentage;
        private final boolean hasWarning;
        private final boolean isCritical;

        public MemoryStatus(String used, String max, String percentage, boolean hasWarning, boolean isCritical) {
            this.used = used;
            this.max = max;
            this.percentage = percentage;
            this.hasWarning = hasWarning;
            this.isCritical = isCritical;
        }

        public Object getDetails() {
            return Map.of(
                "used", used,
                "max", max,
                "percentage", percentage,
                "status", isCritical ? "CRITICAL" : hasWarning ? "WARNING" : "OK"
            );
        }

        public boolean hasWarning() {
            return hasWarning;
        }

        public boolean isCritical() {
            return isCritical;
        }
    }

    private static class DataIntegrityStatus {
        private final boolean healthy;
        private final long userCount;
        private final long productCount;
        private final long orderCount;

        public DataIntegrityStatus(boolean healthy, long userCount, long productCount, long orderCount) {
            this.healthy = healthy;
            this.userCount = userCount;
            this.productCount = productCount;
            this.orderCount = orderCount;
        }

        public Object getDetails() {
            return Map.of(
                "status", healthy ? "HEALTHY" : "UNHEALTHY",
                "userCount", userCount,
                "productCount", productCount,
                "orderCount", orderCount,
                "repositoriesAccessible", userCount >= 0 && productCount >= 0 && orderCount >= 0
            );
        }

        public boolean isHealthy() {
            return healthy;
        }
    }
}