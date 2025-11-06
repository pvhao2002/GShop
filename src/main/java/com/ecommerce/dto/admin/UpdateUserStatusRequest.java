package com.ecommerce.dto.admin;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for updating user status (active/inactive).
 * Used by administrators to manage user account status.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateUserStatusRequest {
    
    @NotNull(message = "Active status is required")
    private Boolean isActive;
}