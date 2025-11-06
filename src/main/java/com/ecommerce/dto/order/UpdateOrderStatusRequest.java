package com.ecommerce.dto.order;

import com.ecommerce.entity.OrderStatus;
import com.ecommerce.validation.ValidOrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for updating order status.
 * Used by admin endpoints to change order status.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateOrderStatusRequest {
    
    @NotNull(message = "Order status is required")
    @ValidOrderStatus
    private OrderStatus status;
    
    private String notes;
}