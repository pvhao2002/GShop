package com.ecommerce.validation;

import com.ecommerce.entity.OrderStatus;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/**
 * Validator for OrderStatus enum.
 * Validates that the order status is valid.
 */
public class OrderStatusValidator implements ConstraintValidator<ValidOrderStatus, OrderStatus> {
    
    @Override
    public void initialize(ValidOrderStatus constraintAnnotation) {
        // No initialization needed
    }
    
    @Override
    public boolean isValid(OrderStatus orderStatus, ConstraintValidatorContext context) {
        if (orderStatus == null) {
            return false;
        }
        
        // All enum values are valid for status updates
        return orderStatus == OrderStatus.PENDING || 
               orderStatus == OrderStatus.PROCESSING || 
               orderStatus == OrderStatus.SHIPPED || 
               orderStatus == OrderStatus.DELIVERED || 
               orderStatus == OrderStatus.CANCELLED;
    }
}