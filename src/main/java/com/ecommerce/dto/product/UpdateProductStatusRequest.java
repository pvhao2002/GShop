package com.ecommerce.dto.product;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for updating product status.
 * Used by admin endpoints for activating/deactivating products.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProductStatusRequest {
    
    @NotNull(message = "Status is required")
    private Boolean isActive;
}