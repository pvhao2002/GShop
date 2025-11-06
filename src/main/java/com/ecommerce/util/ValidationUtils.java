package com.ecommerce.util;

import com.ecommerce.exception.ValidationException;
import lombok.experimental.UtilityClass;

import java.math.BigDecimal;
import java.util.regex.Pattern;

/**
 * Utility class for common validation operations.
 * Provides reusable validation logic across the application.
 */
@UtilityClass
public class ValidationUtils {

    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
    );
    
    private static final Pattern PHONE_PATTERN = Pattern.compile(
            "^[+]?[0-9]{10,15}$"
    );
    
    private static final Pattern PASSWORD_PATTERN = Pattern.compile(
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d@$!%*?&]{8,}$"
    );

    /**
     * Validate email format
     */
    public static void validateEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new ValidationException("Email is required");
        }
        
        if (!EMAIL_PATTERN.matcher(email).matches()) {
            throw new ValidationException("Invalid email format");
        }
    }

    /**
     * Validate phone number format
     */
    public static void validatePhone(String phone) {
        if (phone != null && !phone.trim().isEmpty()) {
            if (!PHONE_PATTERN.matcher(phone).matches()) {
                throw new ValidationException("Invalid phone number format");
            }
        }
    }

    /**
     * Validate password strength
     */
    public static void validatePassword(String password) {
        if (password == null || password.trim().isEmpty()) {
            throw new ValidationException("Password is required");
        }
        
        if (password.length() < 8) {
            throw new ValidationException("Password must be at least 8 characters long");
        }
        
        if (password.length() > 100) {
            throw new ValidationException("Password must not exceed 100 characters");
        }
    }

    /**
     * Validate password confirmation
     */
    public static void validatePasswordConfirmation(String password, String confirmPassword) {
        if (confirmPassword == null || confirmPassword.trim().isEmpty()) {
            throw new ValidationException("Password confirmation is required");
        }
        
        if (!password.equals(confirmPassword)) {
            throw new ValidationException("Passwords do not match");
        }
    }

    /**
     * Validate price value
     */
    public static void validatePrice(BigDecimal price) {
        if (price == null) {
            throw new ValidationException("Price is required");
        }
        
        if (price.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ValidationException("Price must be greater than 0");
        }
        
        if (price.scale() > 2) {
            throw new ValidationException("Price can have at most 2 decimal places");
        }
    }

    /**
     * Validate quantity value
     */
    public static void validateQuantity(Integer quantity) {
        if (quantity == null) {
            throw new ValidationException("Quantity is required");
        }
        
        if (quantity <= 0) {
            throw new ValidationException("Quantity must be greater than 0");
        }
    }

    /**
     * Validate string length
     */
    public static void validateStringLength(String value, String fieldName, int minLength, int maxLength) {
        if (value == null || value.trim().isEmpty()) {
            throw new ValidationException(fieldName + " is required");
        }
        
        if (value.length() < minLength) {
            throw new ValidationException(fieldName + " must be at least " + minLength + " characters long");
        }
        
        if (value.length() > maxLength) {
            throw new ValidationException(fieldName + " must not exceed " + maxLength + " characters");
        }
    }

    /**
     * Validate that a value is not null
     */
    public static void validateNotNull(Object value, String fieldName) {
        if (value == null) {
            throw new ValidationException(fieldName + " is required");
        }
    }

    /**
     * Validate that a string is not blank
     */
    public static void validateNotBlank(String value, String fieldName) {
        if (value == null || value.trim().isEmpty()) {
            throw new ValidationException(fieldName + " is required");
        }
    }
}