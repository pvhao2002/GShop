package com.ecommerce.actuator;

import com.ecommerce.repository.UserRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.actuator.info.Info;
import org.springframework.boot.actuator.info.InfoContributor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

/**
 * Custom info contributor that adds application-specific information
 * to the actuator info endpoint.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ApplicationInfoContributor implements InfoContributor {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    @Override
    public void contribute(Info.Builder builder) {
        try {
            // Add application statistics
            Map<String, Object> appStats = new HashMap<>();
            appStats.put("totalUsers", userRepository.count());
            appStats.put("totalProducts", productRepository.count());
            appStats.put("totalOrders", orderRepository.count());
            appStats.put("lastUpdated", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            
            builder.withDetail("applicationStatistics", appStats);
            
            // Add build information
            Map<String, Object> buildInfo = new HashMap<>();
            buildInfo.put("name", "E-commerce Backend API");
            buildInfo.put("description", "REST API for mobile e-commerce application");
            buildInfo.put("version", "1.0.0");
            buildInfo.put("javaVersion", System.getProperty("java.version"));
            buildInfo.put("springBootVersion", getSpringBootVersion());
            
            builder.withDetail("build", buildInfo);
            
            // Add feature flags or configuration info
            Map<String, Object> features = new HashMap<>();
            features.put("jwtAuthentication", true);
            features.put("actuatorMonitoring", true);
            features.put("structuredLogging", true);
            features.put("customHealthChecks", true);
            features.put("metricsCollection", true);
            
            builder.withDetail("features", features);
            
            // Add environment information
            Map<String, Object> environment = new HashMap<>();
            environment.put("activeProfile", System.getProperty("spring.profiles.active", "default"));
            environment.put("timezone", System.getProperty("user.timezone"));
            environment.put("encoding", System.getProperty("file.encoding"));
            
            builder.withDetail("environment", environment);
            
            log.debug("Application info contributed successfully");
            
        } catch (Exception e) {
            log.error("Failed to contribute application info", e);
            builder.withDetail("error", "Failed to retrieve application statistics");
        }
    }

    private String getSpringBootVersion() {
        try {
            Package pkg = org.springframework.boot.SpringBootVersion.class.getPackage();
            return pkg.getImplementationVersion();
        } catch (Exception e) {
            return "unknown";
        }
    }
}