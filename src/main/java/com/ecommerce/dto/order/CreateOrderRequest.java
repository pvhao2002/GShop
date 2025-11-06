package com.ecommerce.dto.order;

import com.ecommerce.entity.Address;
import com.ecommerce.entity.PaymentMethod;
import com.ecommerce.validation.ValidPaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Request DTO for creating a new order.
 * Contains order items, shipping address, and payment method.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateOrderRequest {
    
    @NotEmpty(message = "Order items cannot be empty")
    @Valid
    private List<CreateOrderItemRequest> items;
    
    @NotNull(message = "Shipping address is required")
    @Valid
    private Address shippingAddress;
    
    @NotNull(message = "Payment method is required")
    @ValidPaymentMethod
    private PaymentMethod paymentMethod;
}