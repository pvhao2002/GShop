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
 * Response DTO for detailed order information.
 * Contains complete order details including all items.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDetailResponse {
    
    private Long id;
    private Long userId;
    private String userEmail;
    private String userName;
    private String phone;
    private List<OrderItemResponse> items;
    private Address shippingAddress;
    private PaymentMethod paymentMethod;
    private OrderStatus status;
    private BigDecimal subtotal;
    private BigDecimal tax;
    private BigDecimal shipping;
    private BigDecimal total;
    private LocalDateTime shippingDate;
    private LocalDateTime deliveryDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}