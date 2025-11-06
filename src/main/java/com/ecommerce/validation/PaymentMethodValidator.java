package com.ecommerce.validation;

import com.ecommerce.entity.PaymentMethod;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/**
 * Validator for PaymentMethod enum.
 * Validates that the payment method is supported.
 */
public class PaymentMethodValidator implements ConstraintValidator<ValidPaymentMethod, PaymentMethod> {
    
    @Override
    public void initialize(ValidPaymentMethod constraintAnnotation) {
        // No initialization needed
    }
    
    @Override
    public boolean isValid(PaymentMethod paymentMethod, ConstraintValidatorContext context) {
        if (paymentMethod == null) {
            return false;
        }
        
        // All enum values are currently supported
        return paymentMethod == PaymentMethod.VNPAY || 
               paymentMethod == PaymentMethod.MOMO || 
               paymentMethod == PaymentMethod.COD;
    }
}