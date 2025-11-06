package com.ecommerce.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.lang.reflect.Field;

/**
 * Validator for password matching validation.
 * Ensures that password and confirm password fields match.
 */
public class PasswordMatchesValidator implements ConstraintValidator<PasswordMatches, Object> {
    
    private String passwordField;
    private String confirmPasswordField;
    
    @Override
    public void initialize(PasswordMatches constraintAnnotation) {
        this.passwordField = constraintAnnotation.password();
        this.confirmPasswordField = constraintAnnotation.confirmPassword();
    }
    
    @Override
    public boolean isValid(Object obj, ConstraintValidatorContext context) {
        if (obj == null) {
            return true;
        }
        
        try {
            String password = getFieldValue(obj, passwordField);
            String confirmPassword = getFieldValue(obj, confirmPasswordField);
            
            boolean isValid = password != null && password.equals(confirmPassword);
            
            if (!isValid) {
                context.disableDefaultConstraintViolation();
                context.buildConstraintViolationWithTemplate(context.getDefaultConstraintMessageTemplate())
                        .addPropertyNode(confirmPasswordField)
                        .addConstraintViolation();
            }
            
            return isValid;
            
        } catch (Exception e) {
            return false;
        }
    }
    
    private String getFieldValue(Object obj, String fieldName) throws Exception {
        Field field = obj.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        Object value = field.get(obj);
        return value != null ? value.toString() : null;
    }
}