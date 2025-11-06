package com.ecommerce.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * JPA Entity representing a product variant with size, color, and inventory information.
 * Each product can have multiple variants with different attributes and pricing.
 */
@Entity
@Table(name = "product_variants")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariant {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
    
    private String size;
    
    private String color;
    
    private String colorHex;
    
    @Builder.Default
    private Integer quantity = 0;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal additionalPrice;
}