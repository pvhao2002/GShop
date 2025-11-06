package com.ecommerce.dto.order;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Response DTO for order item information.
 * Contains product, variant, and pricing details.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemResponse {
    
    private Long id;
    private Long productId;
    private String productName;
    private String productImage;
    private Long variantId;
    private String variantSize;
    private String variantColor;
    private String variantColorHex;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
}