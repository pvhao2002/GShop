package com.ecommerce.exception;

/**
 * Exception thrown when validation fails.
 * Used for business logic validation errors.
 */
public class ValidationException extends RuntimeException {
    
    public ValidationException(String message) {
        super(message);
    }
    
    public ValidationException(String message, Throwable cause) {
        super(message, cause);
    }
}