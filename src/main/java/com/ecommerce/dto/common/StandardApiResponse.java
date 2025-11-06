package com.ecommerce.dto.common;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Enhanced standard API response wrapper with versioning support.
 * Provides consistent response format across all API endpoints.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class StandardApiResponse<T> {
    
    private String version;
    private boolean success;
    private String message;
    private T data;
    private LocalDateTime timestamp;
    private String requestId;
    private Map<String, Object> metadata;
    private ErrorDetails error;
    
    /**
     * Error details for failed responses
     */
    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ErrorDetails {
        private String code;
        private String message;
        private String field;
        private Object rejectedValue;
        private Map<String, Object> details;
    }
    
    /**
     * Create a successful response with data
     */
    public static <T> StandardApiResponse<T> success(T data) {
        return StandardApiResponse.<T>builder()
                .version("v1")
                .success(true)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }
    
    /**
     * Create a successful response with data and message
     */
    public static <T> StandardApiResponse<T> success(T data, String message) {
        return StandardApiResponse.<T>builder()
                .version("v1")
                .success(true)
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }
    
    /**
     * Create a successful response with data, message and version
     */
    public static <T> StandardApiResponse<T> success(T data, String message, String version) {
        return StandardApiResponse.<T>builder()
                .version(version)
                .success(true)
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }
    
    /**
     * Create a successful response with only message
     */
    public static <T> StandardApiResponse<T> success(String message) {
        return StandardApiResponse.<T>builder()
                .version("v1")
                .success(true)
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();
    }
    
    /**
     * Create an error response with message
     */
    public static <T> StandardApiResponse<T> error(String message) {
        return StandardApiResponse.<T>builder()
                .version("v1")
                .success(false)
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();
    }
    
    /**
     * Create an error response with error details
     */
    public static <T> StandardApiResponse<T> error(String message, ErrorDetails errorDetails) {
        return StandardApiResponse.<T>builder()
                .version("v1")
                .success(false)
                .message(message)
                .error(errorDetails)
                .timestamp(LocalDateTime.now())
                .build();
    }
    
    /**
     * Create an error response with message, error details and version
     */
    public static <T> StandardApiResponse<T> error(String message, ErrorDetails errorDetails, String version) {
        return StandardApiResponse.<T>builder()
                .version(version)
                .success(false)
                .message(message)
                .error(errorDetails)
                .timestamp(LocalDateTime.now())
                .build();
    }
    
    /**
     * Add metadata to the response
     */
    public StandardApiResponse<T> withMetadata(String key, Object value) {
        if (this.metadata == null) {
            this.metadata = new java.util.HashMap<>();
        }
        this.metadata.put(key, value);
        return this;
    }
    
    /**
     * Add request ID for tracing
     */
    public StandardApiResponse<T> withRequestId(String requestId) {
        this.requestId = requestId;
        return this;
    }
}