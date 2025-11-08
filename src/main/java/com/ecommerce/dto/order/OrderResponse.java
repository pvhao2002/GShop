package com.ecommerce.dto.order;

import com.ecommerce.entity.Address;
import com.ecommerce.entity.OrderStatus;
import com.ecommerce.entity.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Response DTO for order information.
 * Contains basic order details without full item information.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {
    private Long id;
    private Long userId;
    private String userEmail;
    private String userName;
    private String phone;
    private Address shippingAddress;
    private PaymentMethod paymentMethod;
    private OrderStatus status;
    private BigDecimal subtotal;
    private BigDecimal tax;
    private BigDecimal shipping;
    private BigDecimal total;
    private Integer itemCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}