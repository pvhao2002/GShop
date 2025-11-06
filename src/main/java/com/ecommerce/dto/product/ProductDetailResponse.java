package com.ecommerce.dto.product;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Detailed response DTO for product information including variants.
 * Used for product detail pages and comprehensive product display.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDetailResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private List<String> images;
    private CategoryResponse category;
    private List<ProductVariantResponse> variants;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<String> availableSizes;
    private List<String> availableColors;
    private Integer totalInventory;
}