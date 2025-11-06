package com.ecommerce.repository;

import com.ecommerce.entity.Category;
import com.ecommerce.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

/**
 * Repository interface for Product entity operations.
 * Provides custom query methods for product search, filtering, and category management.
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    /**
     * Find products by category.
     * Used for category-based product filtering.
     */
    Page<Product> findByCategory(Category category, Pageable pageable);
    
    /**
     * Find products by category ID.
     * Used for category-based product filtering.
     */
    Page<Product> findByCategoryId(Long categoryId, Pageable pageable);
    
    /**
     * Find active products.
     * Used to display only available products to customers.
     */
    Page<Product> findByIsActive(Boolean isActive, Pageable pageable);
    
    /**
     * Find active products by category.
     * Used for category filtering with active status.
     */
    Page<Product> findByCategoryAndIsActive(Category category, Boolean isActive, Pageable pageable);
    
    /**
     * Find active products by category ID.
     * Used for category filtering with active status.
     */
    Page<Product> findByCategoryIdAndIsActive(Long categoryId, Boolean isActive, Pageable pageable);
    
    /**
     * Search products by name (case-insensitive) with optimized fetch joins.
     * Used for product search functionality.
     */
    @Query("SELECT DISTINCT p FROM Product p " +
           "LEFT JOIN FETCH p.category " +
           "LEFT JOIN FETCH p.images " +
           "WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%')) AND p.isActive = true")
    Page<Product> searchByNameIgnoreCase(@Param("name") String name, Pageable pageable);
    
    /**
     * Search products by name and description (case-insensitive) with optimized fetch joins.
     * Used for comprehensive product search functionality.
     */
    @Query("SELECT DISTINCT p FROM Product p " +
           "LEFT JOIN FETCH p.category " +
           "LEFT JOIN FETCH p.images " +
           "WHERE (LOWER(p.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
           "AND p.isActive = true")
    Page<Product> searchByNameOrDescription(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    /**
     * Search products by name or description within a category.
     * Used for category-specific product search.
     */
    @Query("SELECT p FROM Product p WHERE " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
           "AND p.category.id = :categoryId AND p.isActive = true")
    Page<Product> searchByCategoryAndNameOrDescription(@Param("categoryId") Long categoryId, 
                                                      @Param("searchTerm") String searchTerm, 
                                                      Pageable pageable);
    
    /**
     * Find products within a price range.
     * Used for price-based filtering.
     */
    @Query("SELECT p FROM Product p WHERE p.price BETWEEN :minPrice AND :maxPrice AND p.isActive = true")
    Page<Product> findByPriceBetween(@Param("minPrice") BigDecimal minPrice, 
                                   @Param("maxPrice") BigDecimal maxPrice, 
                                   Pageable pageable);
    
    /**
     * Find products by category and price range.
     * Used for combined category and price filtering.
     */
    @Query("SELECT p FROM Product p WHERE p.category.id = :categoryId " +
           "AND p.price BETWEEN :minPrice AND :maxPrice AND p.isActive = true")
    Page<Product> findByCategoryAndPriceBetween(@Param("categoryId") Long categoryId,
                                              @Param("minPrice") BigDecimal minPrice,
                                              @Param("maxPrice") BigDecimal maxPrice,
                                              Pageable pageable);
    
    /**
     * Find featured or popular products.
     * Used for homepage product display.
     */
    @Query("SELECT p FROM Product p WHERE p.isActive = true ORDER BY p.createdAt DESC")
    Page<Product> findLatestProducts(Pageable pageable);
    
    /**
     * Count total active products.
     * Used for dashboard metrics.
     */
    long countByIsActive(Boolean isActive);
    
    /**
     * Count products by category.
     * Used for category analytics.
     */
    long countByCategory(Category category);
    
    /**
     * Find products with low inventory (through variants).
     * Used for inventory management alerts.
     */
    @Query("SELECT DISTINCT p FROM Product p JOIN p.variants v WHERE v.quantity <= :threshold AND p.isActive = true")
    List<Product> findProductsWithLowInventory(@Param("threshold") Integer threshold);
    
    /**
     * Advanced search with multiple filters.
     * Used for comprehensive product filtering with category, price range, and search term.
     */
    @Query("SELECT p FROM Product p WHERE " +
           "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
           "(:searchTerm IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND " +
           "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR p.price <= :maxPrice) AND " +
           "p.isActive = true")
    Page<Product> findWithFilters(@Param("categoryId") Long categoryId,
                                 @Param("searchTerm") String searchTerm,
                                 @Param("minPrice") BigDecimal minPrice,
                                 @Param("maxPrice") BigDecimal maxPrice,
                                 Pageable pageable);
    
    /**
     * Get product statistics for dashboard.
     * Returns total products, active products, and categories count.
     */
    @Query("SELECT " +
           "COUNT(p) as totalProducts, " +
           "SUM(CASE WHEN p.isActive = true THEN 1 ELSE 0 END) as activeProducts, " +
           "COUNT(DISTINCT p.category) as categoriesWithProducts " +
           "FROM Product p")
    Object[] getProductStatistics();
    
    /**
     * Find products by multiple category IDs.
     * Used for filtering products across multiple categories.
     */
    @Query("SELECT p FROM Product p WHERE p.category.id IN :categoryIds AND p.isActive = true")
    Page<Product> findByCategoryIdIn(@Param("categoryIds") List<Long> categoryIds, Pageable pageable);
    
    /**
     * Get price range for products in a category.
     * Used for dynamic price filter ranges.
     */
    @Query("SELECT MIN(p.price) as minPrice, MAX(p.price) as maxPrice FROM Product p " +
           "WHERE (:categoryId IS NULL OR p.category.id = :categoryId) AND p.isActive = true")
    Object[] getPriceRangeByCategory(@Param("categoryId") Long categoryId);
    
    /**
     * Find product with all related data optimized (prevents N+1).
     * Used for product detail page.
     */
    @Query("SELECT DISTINCT p FROM Product p " +
           "LEFT JOIN FETCH p.category " +
           "LEFT JOIN FETCH p.images " +
           "LEFT JOIN FETCH p.variants " +
           "WHERE p.id = :id AND p.isActive = true")
    Product findByIdWithAllData(@Param("id") Long id);
    
    /**
     * Find all active products with category and images (optimized for listing).
     * Used for product listing pages.
     */
    @Query("SELECT DISTINCT p FROM Product p " +
           "LEFT JOIN FETCH p.category " +
           "LEFT JOIN FETCH p.images " +
           "WHERE p.isActive = true")
    Page<Product> findAllActiveWithCategoryAndImages(Pageable pageable);
    
    /**
     * Find products by category with optimized fetch joins.
     * Used for category-based product filtering.
     */
    @Query("SELECT DISTINCT p FROM Product p " +
           "LEFT JOIN FETCH p.category " +
           "LEFT JOIN FETCH p.images " +
           "WHERE p.category.id = :categoryId AND p.isActive = true")
    Page<Product> findByCategoryIdWithOptimizedFetch(@Param("categoryId") Long categoryId, Pageable pageable);
}