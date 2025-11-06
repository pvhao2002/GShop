package com.ecommerce.exception;

/**
 * Exception thrown when user lacks permission to access a resource.
 * Used for role-based authorization failures.
 */
public class AccessDeniedException extends RuntimeException {
    
    public AccessDeniedException(String message) {
        super(message);
    }
    
    public AccessDeniedException(String message, Throwable cause) {
        super(message, cause);
    }
}