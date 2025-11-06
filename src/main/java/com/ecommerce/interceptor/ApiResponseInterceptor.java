package com.ecommerce.interceptor;

import com.ecommerce.config.ApiVersioningConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.UUID;

/**
 * API Response Interceptor for adding standard headers and metadata
 * Handles API versioning, request tracking, and response formatting
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ApiResponseInterceptor implements HandlerInterceptor {

    private final ApiVersioningConfig.ApiVersionResolver apiVersionResolver;
    
    public static final String REQUEST_ID_HEADER = "X-Request-ID";
    public static final String API_VERSION_RESPONSE_HEADER = "X-API-Version";
    public static final String RESPONSE_TIME_HEADER = "X-Response-Time";
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // Generate request ID for tracing
        String requestId = UUID.randomUUID().toString();
        request.setAttribute("requestId", requestId);
        request.setAttribute("startTime", System.currentTimeMillis());
        
        // Resolve API version
        String apiVersion = apiVersionResolver.resolveVersion(request);
        request.setAttribute("apiVersion", apiVersion);
        
        // Add CORS and API headers
        response.setHeader(REQUEST_ID_HEADER, requestId);
        response.setHeader(API_VERSION_RESPONSE_HEADER, apiVersion);
        
        // Add cache control headers for API responses
        if (request.getRequestURI().startsWith("/api/")) {
            response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            response.setHeader("Pragma", "no-cache");
            response.setHeader("Expires", "0");
        }
        
        log.debug("API request started - ID: {}, Version: {}, URI: {}", 
                requestId, apiVersion, request.getRequestURI());
        
        return true;
    }
    
    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, 
                               Object handler, Exception ex) {
        Long startTime = (Long) request.getAttribute("startTime");
        String requestId = (String) request.getAttribute("requestId");
        
        if (startTime != null) {
            long responseTime = System.currentTimeMillis() - startTime;
            response.setHeader(RESPONSE_TIME_HEADER, String.valueOf(responseTime) + "ms");
            
            log.debug("API request completed - ID: {}, Response Time: {}ms, Status: {}", 
                    requestId, responseTime, response.getStatus());
        }
        
        if (ex != null) {
            log.error("API request failed - ID: {}, Error: {}", requestId, ex.getMessage(), ex);
        }
    }
}