package com.ecommerce.repository;

import com.ecommerce.entity.Product;
import com.ecommerce.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for ProductVariant entity operations.
 * Provides custom query methods for product variant management and inventory operations.
 */
@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
    
    /**
     * Find variants by product.
     * Used for product detail display and variant management.
     */
    List<ProductVariant> findByProduct(Product product);
    
    /**
     * Find variants by product ID.
     * Used for product detail display and variant management.
     */
    List<ProductVariant> findByProductId(Long productId);
    
    /**
     * Find variant by product, size, and color.
     * Used for specific variant lookup during order creation.
     */
    Optional<ProductVariant> findByProductAndSizeAndColor(Product product, String size, String color);
    
    /**
     * Find variant by product ID, size, and color.
     * Used for specific variant lookup during order creation.
     */
    Optional<ProductVariant> findByProductIdAndSizeAndColor(Long productId, String size, String color);
    
    /**
     * Find variants with available inventory.
     * Used for displaying available product options.
     */
    @Query("SELECT pv FROM ProductVariant pv WHERE pv.quantity > 0")
    List<ProductVariant> findAvailableVariants();
    
    /**
     * Find variants with low inventory.
     * Used for inventory management alerts.
     */
    @Query("SELECT pv FROM ProductVariant pv WHERE pv.quantity <= :threshold AND pv.quantity > 0")
    List<ProductVariant> findLowInventoryVariants(@Param("threshold") Integer threshold);
    
    /**
     * Find out of stock variants.
     * Used for inventory management.
     */
    @Query("SELECT pv FROM ProductVariant pv WHERE pv.quantity = 0")
    List<ProductVariant> findOutOfStockVariants();
    
    /**
     * Find variants by product with available inventory.
     * Used for product detail display with stock filtering.
     */
    @Query("SELECT pv FROM ProductVariant pv WHERE pv.product.id = :productId AND pv.quantity > 0")
    List<ProductVariant> findAvailableVariantsByProductId(@Param("productId") Long productId);
    
    /**
     * Get distinct sizes for a product.
     * Used for product filtering and display.
     */
    @Query("SELECT DISTINCT pv.size FROM ProductVariant pv WHERE pv.product.id = :productId AND pv.quantity > 0")
    List<String> findDistinctSizesByProductId(@Param("productId") Long productId);
    
    /**
     * Get distinct colors for a product.
     * Used for product filtering and display.
     */
    @Query("SELECT DISTINCT pv.color FROM ProductVariant pv WHERE pv.product.id = :productId AND pv.quantity > 0")
    List<String> findDistinctColorsByProductId(@Param("productId") Long productId);
    
    /**
     * Calculate total inventory for a product.
     * Used for product inventory summary.
     */
    @Query("SELECT COALESCE(SUM(pv.quantity), 0) FROM ProductVariant pv WHERE pv.product.id = :productId")
    Integer calculateTotalInventoryByProductId(@Param("productId") Long productId);
}