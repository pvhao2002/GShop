package com.ecommerce.exception;

import com.ecommerce.dto.common.ErrorResponse;
import com.ecommerce.dto.common.StandardApiResponse;
import com.ecommerce.util.LoggingUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.context.request.ServletWebRequest;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Global exception handler for centralized error handling across the application.
 * Provides consistent error responses and logging for all exceptions.
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    /**
     * Handle constraint violation errors
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolation(
            ConstraintViolationException ex, WebRequest request) {
        
        log.warn("Constraint violation on request to {}: {}", 
                request.getDescription(false), ex.getMessage());
        
        List<ErrorResponse.ValidationError> validationErrors = ex.getConstraintViolations()
                .stream()
                .map(violation -> ErrorResponse.ValidationError.builder()
                        .field(violation.getPropertyPath().toString())
                        .message(violation.getMessage())
                        .rejectedValue(violation.getInvalidValue())
                        .build())
                .collect(Collectors.toList());
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .error("CONSTRAINT_VIOLATION")
                .message("Constraint validation failed")
                .timestamp(LocalDateTime.now())
                .path(extractPath(request))
                .validationErrors(validationErrors)
                .build();
        
        return ResponseEntity.badRequest().body(errorResponse);
    }

    /**
     * Handle custom validation exceptions
     */
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ErrorResponse> handleValidation(
            ValidationException ex, WebRequest request) {
        
        log.warn("Business validation error on request to {}: {}", 
                request.getDescription(false), ex.getMessage());
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .error("VALIDATION_ERROR")
                .message(ex.getMessage())
                .timestamp(LocalDateTime.now())
                .path(extractPath(request))
                .build();
        
        return ResponseEntity.badRequest().body(errorResponse);
    }

    /**
     * Handle resource not found exceptions
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(
            ResourceNotFoundException ex, WebRequest request) {
        
        log.warn("Resource not found on request to {}: {}", 
                request.getDescription(false), ex.getMessage());
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .error("RESOURCE_NOT_FOUND")
                .message(ex.getMessage())
                .timestamp(LocalDateTime.now())
                .path(extractPath(request))
                .build();
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
    }

    /**
     * Handle unauthorized access exceptions
     */
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorized(
            UnauthorizedException ex, WebRequest request) {
        
        // Log security event
        HttpServletRequest httpRequest = getHttpServletRequest(request);
        if (httpRequest != null) {
            LoggingUtils.logUnauthorizedAccess(
                httpRequest.getRequestURI(), 
                httpRequest.getMethod(), 
                LoggingUtils.getClientIpAddress(httpRequest)
            );
        }
        
        log.warn("Unauthorized access attempt on request to {}: {}", 
                request.getDescription(false), ex.getMessage());
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .error("UNAUTHORIZED")
                .message(ex.getMessage())
                .timestamp(LocalDateTime.now())
                .path(extractPath(request))
                .build();
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
    }

    /**
     * Handle Spring Security authentication exceptions
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthentication(
            AuthenticationException ex, WebRequest request) {
        
        // Log security event
        HttpServletRequest httpRequest = getHttpServletRequest(request);
        if (httpRequest != null) {
            String reason = ex instanceof BadCredentialsException ? "Invalid credentials" : "Authentication failed";
            LoggingUtils.logAuthenticationFailure("unknown", LoggingUtils.getClientIpAddress(httpRequest), reason);
        }
        
        log.warn("Authentication failed on request to {}: {}", 
                request.getDescription(false), ex.getMessage());
        
        String message = ex instanceof BadCredentialsException ? 
                "Invalid credentials provided" : "Authentication failed";
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .error("AUTHENTICATION_FAILED")
                .message(message)
                .timestamp(LocalDateTime.now())
                .path(extractPath(request))
                .build();
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
    }

    /**
     * Handle access denied exceptions
     */
    @ExceptionHandler({AccessDeniedException.class, org.springframework.security.access.AccessDeniedException.class})
    public ResponseEntity<ErrorResponse> handleAccessDenied(
            Exception ex, WebRequest request) {
        
        // Log security event
        HttpServletRequest httpRequest = getHttpServletRequest(request);
        if (httpRequest != null) {
            LoggingUtils.logAccessDenied(
                httpRequest.getRequestURI(), 
                httpRequest.getMethod(), 
                LoggingUtils.getCurrentUserEmail(),
                LoggingUtils.getClientIpAddress(httpRequest)
            );
        }
        
        log.warn("Access denied on request to {}: {}", 
                request.getDescription(false), ex.getMessage());
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .error("ACCESS_DENIED")
                .message("You don't have permission to access this resource")
                .timestamp(LocalDateTime.now())
                .path(extractPath(request))
                .build();
        
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
    }

    /**
     * Handle illegal argument exceptions
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(
            IllegalArgumentException ex, WebRequest request) {
        
        log.warn("Illegal argument on request to {}: {}", 
                request.getDescription(false), ex.getMessage());
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .error("INVALID_ARGUMENT")
                .message(ex.getMessage())
                .timestamp(LocalDateTime.now())
                .path(extractPath(request))
                .build();
        
        return ResponseEntity.badRequest().body(errorResponse);
    }

    /**
     * Handle all other unexpected exceptions
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(
            Exception ex, WebRequest request) {
        
        // Log error with context
        LoggingUtils.logError("Unexpected error", ex.getMessage(), ex);
        log.error("Unexpected error occurred on request to {}: {}", 
                request.getDescription(false), ex.getMessage(), ex);
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .error("INTERNAL_SERVER_ERROR")
                .message("An unexpected error occurred. Please try again later.")
                .timestamp(LocalDateTime.now())
                .path(extractPath(request))
                .build();
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }

    /**
     * Extract the request path from WebRequest
     */
    private String extractPath(WebRequest request) {
        String description = request.getDescription(false);
        if (description.startsWith("uri=")) {
            return description.substring(4);
        }
        return description;
    }

    /**
     * Extract HttpServletRequest from WebRequest
     */
    private HttpServletRequest getHttpServletRequest(WebRequest request) {
        if (request instanceof ServletWebRequest) {
            return ((ServletWebRequest) request).getRequest();
        }
        return null;
    }
    
    /**
     * Handle validation errors with enhanced response format
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<StandardApiResponse<Object>> handleMethodArgumentNotValidEnhanced(
            MethodArgumentNotValidException ex, HttpServletRequest request) {
        
        log.warn("Validation error on request to {}: {}", 
                request.getRequestURI(), ex.getMessage());
        
        List<StandardApiResponse.ErrorDetails> validationErrors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> StandardApiResponse.ErrorDetails.builder()
                        .code("FIELD_VALIDATION_ERROR")
                        .message(error.getDefaultMessage())
                        .field(error.getField())
                        .rejectedValue(error.getRejectedValue())
                        .build())
                .collect(Collectors.toList());
        
        StandardApiResponse.ErrorDetails mainError = StandardApiResponse.ErrorDetails.builder()
                .code("VALIDATION_ERROR")
                .message("Validation failed for one or more fields")
                .details(validationErrors.stream().collect(Collectors.toMap(
                    err -> err.getField(),
                    err -> err.getMessage()
                )))
                .build();
        
        String requestId = (String) request.getAttribute("requestId");
        String apiVersion = (String) request.getAttribute("apiVersion");
        
        StandardApiResponse<Object> response = StandardApiResponse.error(
                "Validation failed", mainError, apiVersion != null ? apiVersion : "v1")
                .withRequestId(requestId);
        
        return ResponseEntity.badRequest().body(response);
    }
}