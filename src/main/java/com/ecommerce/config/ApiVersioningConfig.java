package com.ecommerce.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ContentNegotiationConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * API Versioning Configuration
 * Supports multiple versioning strategies for backward compatibility
 */
@Configuration
@Slf4j
public class ApiVersioningConfig implements WebMvcConfigurer {

    public static final String DEFAULT_API_VERSION = "v1";
    public static final String API_VERSION_HEADER = "X-API-Version";
    public static final String API_VERSION_PARAM = "version";
    
    /**
     * Configure content negotiation for API versioning
     */
    @Override
    public void configureContentNegotiation(ContentNegotiationConfigurer configurer) {
        configurer
                .favorParameter(true)
                .parameterName(API_VERSION_PARAM)
                .favorPathExtension(false)
                .ignoreAcceptHeader(false)
                .useRegisteredExtensionsOnly(false)
                .defaultContentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .mediaType("json", org.springframework.http.MediaType.APPLICATION_JSON)
                .mediaType("xml", org.springframework.http.MediaType.APPLICATION_XML);
        
        log.info("API versioning configured with default version: {}", DEFAULT_API_VERSION);
    }
    
    /**
     * API version resolver bean
     */
    @Bean
    public ApiVersionResolver apiVersionResolver() {
        return new ApiVersionResolver();
    }
    
    /**
     * API version resolver implementation
     */
    public static class ApiVersionResolver {
        
        /**
         * Resolve API version from request
         */
        public String resolveVersion(jakarta.servlet.http.HttpServletRequest request) {
            // 1. Check header first
            String version = request.getHeader(API_VERSION_HEADER);
            if (version != null && !version.isEmpty()) {
                log.debug("API version resolved from header: {}", version);
                return normalizeVersion(version);
            }
            
            // 2. Check query parameter
            version = request.getParameter(API_VERSION_PARAM);
            if (version != null && !version.isEmpty()) {
                log.debug("API version resolved from parameter: {}", version);
                return normalizeVersion(version);
            }
            
            // 3. Check Accept header for media type versioning
            String acceptHeader = request.getHeader("Accept");
            if (acceptHeader != null && acceptHeader.contains("version=")) {
                version = extractVersionFromAcceptHeader(acceptHeader);
                if (version != null) {
                    log.debug("API version resolved from Accept header: {}", version);
                    return normalizeVersion(version);
                }
            }
            
            // 4. Default version
            log.debug("Using default API version: {}", DEFAULT_API_VERSION);
            return DEFAULT_API_VERSION;
        }
        
        /**
         * Normalize version string (ensure it starts with 'v')
         */
        private String normalizeVersion(String version) {
            if (version == null || version.isEmpty()) {
                return DEFAULT_API_VERSION;
            }
            
            version = version.trim().toLowerCase();
            if (!version.startsWith("v")) {
                version = "v" + version;
            }
            
            return version;
        }
        
        /**
         * Extract version from Accept header
         */
        private String extractVersionFromAcceptHeader(String acceptHeader) {
            try {
                String[] parts = acceptHeader.split(";");
                for (String part : parts) {
                    part = part.trim();
                    if (part.startsWith("version=")) {
                        return part.substring(8);
                    }
                }
            } catch (Exception e) {
                log.warn("Error parsing version from Accept header: {}", acceptHeader, e);
            }
            return null;
        }
        
        /**
         * Check if version is supported
         */
        public boolean isVersionSupported(String version) {
            return "v1".equals(version); // Currently only v1 is supported
        }
    }
}