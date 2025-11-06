package com.ecommerce.dto.product;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Response DTO for product variant information.
 * Used for displaying product options and inventory details.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariantResponse {
    private Long id;
    private String size;
    private String color;
    private String colorHex;
    private Integer quantity;
    private BigDecimal additionalPrice;
    private Boolean isAvailable;
}