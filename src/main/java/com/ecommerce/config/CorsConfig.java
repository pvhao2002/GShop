package com.ecommerce.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * CORS Configuration for mobile app integration
 * Handles cross-origin requests from Expo mobile app and admin interfaces
 */
@Configuration
@Slf4j
public class CorsConfig {

    @Value("${cors.allowed-origins}")
    private String allowedOrigins;

    @Value("${cors.allowed-methods}")
    private String allowedMethods;

    @Value("${cors.allowed-headers}")
    private String allowedHeaders;

    @Value("${cors.allow-credentials}")
    private boolean allowCredentials;

    @Value("${cors.max-age:3600}")
    private long maxAge;

    /**
     * CORS configuration source for mobile app integration
     * Supports Expo development server, production mobile apps, and admin interfaces
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        log.info("Configuring CORS for mobile app integration");
        log.debug("CORS allowed origins: {}", allowedOrigins);
        log.debug("CORS allowed methods: {}", allowedMethods);
        log.debug("CORS allowed headers: {}", allowedHeaders);
        log.debug("CORS allow credentials: {}", allowCredentials);
        log.debug("CORS max age: {} seconds", maxAge);
        
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Configure allowed origins for mobile app
        if ("*".equals(allowedOrigins.trim())) {
            // Allow all origins (development only)
            configuration.setAllowedOriginPatterns(List.of("*"));
            log.warn("CORS configured to allow all origins - ensure this is only used in development");
        } else {
            // Specific origins for production
            List<String> origins = Arrays.asList(allowedOrigins.split(","));
            configuration.setAllowedOrigins(origins);
            log.info("CORS configured with specific origins: {}", origins);
        }
        
        // Configure allowed HTTP methods
        List<String> methods = Arrays.asList(allowedMethods.split(","));
        configuration.setAllowedMethods(methods);
        
        // Configure allowed headers
        if ("*".equals(allowedHeaders.trim())) {
            configuration.setAllowedHeaders(List.of("*"));
        } else {
            List<String> headers = Arrays.asList(allowedHeaders.split(","));
            configuration.setAllowedHeaders(headers);
        }
        
        // Configure credentials support for authentication
        configuration.setAllowCredentials(allowCredentials);
        
        // Expose headers that mobile app needs to read
        configuration.setExposedHeaders(Arrays.asList(
            "Authorization",           // JWT token
            "Content-Type",           // Response content type
            "X-Requested-With",       // AJAX requests
            "Accept",                 // Accept header
            "Origin",                 // Origin header
            "Access-Control-Request-Method",    // Preflight method
            "Access-Control-Request-Headers",   // Preflight headers
            "X-API-Version",          // API versioning
            "X-Total-Count",          // Pagination total count
            "X-Page-Number",          // Current page number
            "X-Page-Size",            // Page size
            "X-Request-ID"            // Request tracking
        ));
        
        // Set preflight cache duration
        configuration.setMaxAge(maxAge);

        // Apply CORS configuration to all API endpoints
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        
        log.info("CORS configuration completed successfully");
        return source;
    }

    /**
     * Validates CORS configuration on startup
     */
    public void validateCorsConfiguration() {
        log.info("Validating CORS configuration...");
        
        if (allowCredentials && "*".equals(allowedOrigins.trim())) {
            log.warn("SECURITY WARNING: CORS is configured to allow credentials with wildcard origins. " +
                    "This is not secure for production environments.");
        }
        
        if (allowedOrigins.contains("localhost") || allowedOrigins.contains("127.0.0.1")) {
            log.info("CORS configured for local development with localhost origins");
        }
        
        if (allowedOrigins.contains("exp://")) {
            log.info("CORS configured for Expo development server");
        }
        
        log.info("CORS configuration validation completed");
    }
}