package com.ecommerce.util;

import com.ecommerce.dto.common.EnhancedPagedResponse;
import com.ecommerce.dto.common.StandardApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

/**
 * Utility class for standardizing API responses
 * Provides consistent response formatting across all controllers
 */
@Slf4j
public class ResponseUtils {

    private static final String REQUEST_ID_ATTRIBUTE = "requestId";
    private static final String API_VERSION_ATTRIBUTE = "apiVersion";
    
    /**
     * Create successful response with data
     */
    public static <T> ResponseEntity<StandardApiResponse<T>> success(T data) {
        return ResponseEntity.ok(StandardApiResponse.success(data));
    }
    
    /**
     * Create successful response with data and message
     */
    public static <T> ResponseEntity<StandardApiResponse<T>> success(T data, String message) {
        return ResponseEntity.ok(StandardApiResponse.success(data, message));
    }
    
    /**
     * Create successful response with data, message and request context
     */
    public static <T> ResponseEntity<StandardApiResponse<T>> success(T data, String message, HttpServletRequest request) {
        String requestId = (String) request.getAttribute(REQUEST_ID_ATTRIBUTE);
        String apiVersion = (String) request.getAttribute(API_VERSION_ATTRIBUTE);
        
        StandardApiResponse<T> response = StandardApiResponse.success(data, message, apiVersion)
                .withRequestId(requestId);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Create successful paginated response
     */
    public static <T> ResponseEntity<StandardApiResponse<EnhancedPagedResponse<T>>> successPaged(Page<T> page) {
        EnhancedPagedResponse<T> pagedData = EnhancedPagedResponse.from(page);
        return ResponseEntity.ok(StandardApiResponse.success(pagedData));
    }
    
    /**
     * Create successful paginated response with request context and headers
     */
    public static <T> ResponseEntity<StandardApiResponse<EnhancedPagedResponse<T>>> successPaged(
            Page<T> page, HttpServletRequest request) {
        
        String requestId = (String) request.getAttribute(REQUEST_ID_ATTRIBUTE);
        String apiVersion = (String) request.getAttribute(API_VERSION_ATTRIBUTE);
        
        EnhancedPagedResponse<T> pagedData = EnhancedPagedResponse.from(page);
        StandardApiResponse<EnhancedPagedResponse<T>> response = 
                StandardApiResponse.success(pagedData, null, apiVersion)
                        .withRequestId(requestId)
                        .withMetadata("totalElements", page.getTotalElements())
                        .withMetadata("totalPages", page.getTotalPages())
                        .withMetadata("currentPage", page.getNumber());
        
        // Add pagination headers
        HttpHeaders headers = new HttpHeaders();
        headers.add("X-Total-Count", String.valueOf(page.getTotalElements()));
        headers.add("X-Page-Number", String.valueOf(page.getNumber()));
        headers.add("X-Page-Size", String.valueOf(page.getSize()));
        headers.add("X-Total-Pages", String.valueOf(page.getTotalPages()));
        
        return ResponseEntity.ok().headers(headers).body(response);
    }
    
    /**
     * Create error response
     */
    public static <T> ResponseEntity<StandardApiResponse<T>> error(String message, HttpStatus status) {
        return ResponseEntity.status(status).body(StandardApiResponse.error(message));
    }
    
    /**
     * Create error response with request context
     */
    public static <T> ResponseEntity<StandardApiResponse<T>> error(String message, HttpStatus status, HttpServletRequest request) {
        String requestId = (String) request.getAttribute(REQUEST_ID_ATTRIBUTE);
        String apiVersion = (String) request.getAttribute(API_VERSION_ATTRIBUTE);
        
        StandardApiResponse<T> response = StandardApiResponse.<T>error(message, null, apiVersion)
                .withRequestId(requestId);
        
        return ResponseEntity.status(status).body(response);
    }
    
    /**
     * Create error response with detailed error information
     */
    public static <T> ResponseEntity<StandardApiResponse<T>> error(String message, 
                                                                  StandardApiResponse.ErrorDetails errorDetails, 
                                                                  HttpStatus status, 
                                                                  HttpServletRequest request) {
        String requestId = (String) request.getAttribute(REQUEST_ID_ATTRIBUTE);
        String apiVersion = (String) request.getAttribute(API_VERSION_ATTRIBUTE);
        
        StandardApiResponse<T> response = StandardApiResponse.<T>error(message, errorDetails, apiVersion)
                .withRequestId(requestId);
        
        return ResponseEntity.status(status).body(response);
    }
    
    /**
     * Create created response (201)
     */
    public static <T> ResponseEntity<StandardApiResponse<T>> created(T data, String message) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(StandardApiResponse.success(data, message));
    }
    
    /**
     * Create created response with request context
     */
    public static <T> ResponseEntity<StandardApiResponse<T>> created(T data, String message, HttpServletRequest request) {
        String requestId = (String) request.getAttribute(REQUEST_ID_ATTRIBUTE);
        String apiVersion = (String) request.getAttribute(API_VERSION_ATTRIBUTE);
        
        StandardApiResponse<T> response = StandardApiResponse.success(data, message, apiVersion)
                .withRequestId(requestId);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    /**
     * Create no content response (204)
     */
    public static ResponseEntity<Void> noContent() {
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Extract pagination parameters from request
     */
    public static Map<String, Object> extractPaginationParams(HttpServletRequest request) {
        Map<String, Object> params = new HashMap<>();
        
        try {
            int page = Integer.parseInt(request.getParameter("page") != null ? request.getParameter("page") : "0");
            int size = Integer.parseInt(request.getParameter("size") != null ? request.getParameter("size") : "20");
            String sort = request.getParameter("sort");
            String direction = request.getParameter("direction");
            
            // Validate and limit page size
            size = Math.min(size, 100); // Max 100 items per page
            size = Math.max(size, 1);   // Min 1 item per page
            page = Math.max(page, 0);   // Min page 0
            
            params.put("page", page);
            params.put("size", size);
            params.put("sort", sort);
            params.put("direction", direction);
            
        } catch (NumberFormatException e) {
            log.warn("Invalid pagination parameters, using defaults", e);
            params.put("page", 0);
            params.put("size", 20);
        }
        
        return params;
    }
}