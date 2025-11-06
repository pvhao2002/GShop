package com.ecommerce.util;

import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import jakarta.servlet.http.HttpServletRequest;
import java.util.UUID;

/**
 * Utility class for structured logging and security event logging.
 * Provides methods for adding context to logs and logging security events.
 */
@Slf4j
public class LoggingUtils {

    // MDC Keys
    public static final String TRACE_ID = "traceId";
    public static final String USER_ID = "userId";
    public static final String USER_EMAIL = "userEmail";
    public static final String REQUEST_URI = "requestUri";
    public static final String REQUEST_METHOD = "requestMethod";
    public static final String CLIENT_IP = "clientIp";

    /**
     * Generate and set a trace ID for request tracking
     */
    public static String generateTraceId() {
        String traceId = UUID.randomUUID().toString().substring(0, 8);
        MDC.put(TRACE_ID, traceId);
        return traceId;
    }

    /**
     * Set user context in MDC for logging
     */
    public static void setUserContext(String userId, String userEmail) {
        if (userId != null) {
            MDC.put(USER_ID, userId);
        }
        if (userEmail != null) {
            MDC.put(USER_EMAIL, userEmail);
        }
    }

    /**
     * Set request context in MDC for logging
     */
    public static void setRequestContext(HttpServletRequest request) {
        MDC.put(REQUEST_URI, request.getRequestURI());
        MDC.put(REQUEST_METHOD, request.getMethod());
        MDC.put(CLIENT_IP, getClientIpAddress(request));
    }

    /**
     * Clear all MDC context
     */
    public static void clearContext() {
        MDC.clear();
    }

    /**
     * Get client IP address from request
     */
    public static String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }

    /**
     * Log successful authentication event
     */
    public static void logAuthenticationSuccess(String email, String clientIp) {
        log.info("SECURITY_EVENT: Authentication successful - email: {}, clientIp: {}", email, clientIp);
    }

    /**
     * Log failed authentication event
     */
    public static void logAuthenticationFailure(String email, String clientIp, String reason) {
        log.warn("SECURITY_EVENT: Authentication failed - email: {}, clientIp: {}, reason: {}", email, clientIp, reason);
    }

    /**
     * Log user registration event
     */
    public static void logUserRegistration(String email, String clientIp) {
        log.info("SECURITY_EVENT: User registration - email: {}, clientIp: {}", email, clientIp);
    }

    /**
     * Log token refresh event
     */
    public static void logTokenRefresh(String email, String clientIp) {
        log.info("SECURITY_EVENT: Token refresh - email: {}, clientIp: {}", email, clientIp);
    }

    /**
     * Log password reset request
     */
    public static void logPasswordResetRequest(String email, String clientIp) {
        log.info("SECURITY_EVENT: Password reset requested - email: {}, clientIp: {}", email, clientIp);
    }

    /**
     * Log unauthorized access attempt
     */
    public static void logUnauthorizedAccess(String uri, String method, String clientIp) {
        log.warn("SECURITY_EVENT: Unauthorized access attempt - uri: {}, method: {}, clientIp: {}", uri, method, clientIp);
    }

    /**
     * Log access denied event
     */
    public static void logAccessDenied(String uri, String method, String userEmail, String clientIp) {
        log.warn("SECURITY_EVENT: Access denied - uri: {}, method: {}, user: {}, clientIp: {}", uri, method, userEmail, clientIp);
    }

    /**
     * Log JWT token validation failure
     */
    public static void logJwtValidationFailure(String reason, String clientIp) {
        log.warn("SECURITY_EVENT: JWT validation failed - reason: {}, clientIp: {}", reason, clientIp);
    }

    /**
     * Get current authenticated user email
     */
    public static String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && 
            !"anonymousUser".equals(authentication.getPrincipal())) {
            return authentication.getName();
        }
        return null;
    }

    /**
     * Log API request with performance metrics
     */
    public static void logApiRequest(String method, String uri, long duration, int statusCode) {
        log.info("API_REQUEST: {} {} - duration: {}ms, status: {}", method, uri, duration, statusCode);
    }

    /**
     * Log business operation
     */
    public static void logBusinessOperation(String operation, String details) {
        log.info("BUSINESS_EVENT: {} - {}", operation, details);
    }

    /**
     * Log error with context
     */
    public static void logError(String operation, String error, Exception e) {
        log.error("ERROR: {} - {} - Exception: {}", operation, error, e.getMessage(), e);
    }
}