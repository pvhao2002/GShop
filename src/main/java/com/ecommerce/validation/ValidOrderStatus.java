package com.ecommerce.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Custom validation annotation for OrderStatus enum.
 * Validates that the order status is valid for transitions.
 */
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = OrderStatusValidator.class)
@Documented
public @interface ValidOrderStatus {
    
    String message() default "Invalid order status";
    
    Class<?>[] groups() default {};
    
    Class<? extends Payload>[] payload() default {};
}