package com.ecommerce.filter;

import com.ecommerce.util.LoggingUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Custom request logging filter that adds structured logging with MDC context.
 * Logs request/response details and performance metrics.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@Slf4j
public class RequestLoggingFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                  HttpServletResponse response, 
                                  FilterChain filterChain) throws ServletException, IOException {
        
        long startTime = System.currentTimeMillis();
        
        // Generate trace ID and set request context
        String traceId = LoggingUtils.generateTraceId();
        LoggingUtils.setRequestContext(request);
        
        try {
            // Log incoming request
            logIncomingRequest(request);
            
            // Continue with the filter chain
            filterChain.doFilter(request, response);
            
        } finally {
            // Calculate duration and log response
            long duration = System.currentTimeMillis() - startTime;
            logOutgoingResponse(request, response, duration);
            
            // Clear MDC context
            LoggingUtils.clearContext();
        }
    }

    private void logIncomingRequest(HttpServletRequest request) {
        String method = request.getMethod();
        String uri = request.getRequestURI();
        String queryString = request.getQueryString();
        String clientIp = LoggingUtils.getClientIpAddress(request);
        String userAgent = request.getHeader("User-Agent");
        
        StringBuilder logMessage = new StringBuilder();
        logMessage.append("Incoming request: ").append(method).append(" ").append(uri);
        
        if (queryString != null) {
            logMessage.append("?").append(queryString);
        }
        
        logMessage.append(" from ").append(clientIp);
        
        if (userAgent != null) {
            logMessage.append(" [").append(userAgent).append("]");
        }
        
        log.info(logMessage.toString());
    }

    private void logOutgoingResponse(HttpServletRequest request, HttpServletResponse response, long duration) {
        String method = request.getMethod();
        String uri = request.getRequestURI();
        int status = response.getStatus();
        
        // Log API request metrics
        LoggingUtils.logApiRequest(method, uri, duration, status);
        
        // Log slow requests
        if (duration > 1000) {
            log.warn("SLOW_REQUEST: {} {} took {}ms", method, uri, duration);
        }
        
        // Log error responses
        if (status >= 400) {
            if (status >= 500) {
                log.error("Server error response: {} {} - status: {}, duration: {}ms", method, uri, status, duration);
            } else {
                log.warn("Client error response: {} {} - status: {}, duration: {}ms", method, uri, status, duration);
            }
        }
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        
        // Skip logging for actuator endpoints and static resources
        return path.startsWith("/actuator/") || 
               path.startsWith("/static/") ||
               path.startsWith("/css/") ||
               path.startsWith("/js/") ||
               path.startsWith("/images/");
    }
}