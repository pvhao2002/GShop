package com.ecommerce.dto.product;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Request DTO for updating a product variant.
 * Used within product update requests.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProductVariantRequest {
    
    private Long id; // For existing variants
    
    @NotBlank(message = "Size is required")
    private String size;
    
    @NotBlank(message = "Color is required")
    private String color;
    
    private String colorHex;
    
    @NotNull(message = "Quantity is required")
    @Min(value = 0, message = "Quantity cannot be negative")
    private Integer quantity;
    
    @DecimalMin(value = "0.00", message = "Additional price cannot be negative")
    @Digits(integer = 8, fraction = 2, message = "Additional price format is invalid")
    private BigDecimal additionalPrice;
}