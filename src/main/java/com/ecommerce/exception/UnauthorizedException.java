package com.ecommerce.exception;

/**
 * Exception thrown when user authentication fails.
 * Used for invalid credentials, expired tokens, etc.
 */
public class UnauthorizedException extends RuntimeException {
    
    public UnauthorizedException(String message) {
        super(message);
    }
    
    public UnauthorizedException(String message, Throwable cause) {
        super(message, cause);
    }
}