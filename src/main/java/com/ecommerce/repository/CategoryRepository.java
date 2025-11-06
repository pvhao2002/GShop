package com.ecommerce.repository;

import com.ecommerce.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Category entity operations.
 * Provides custom query methods for category management and hierarchical operations.
 */
@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    /**
     * Find category by name (case-insensitive).
     * Used for category lookup and validation.
     */
    Optional<Category> findByNameIgnoreCase(String name);
    
    /**
     * Check if category exists by name (case-insensitive).
     * Used for category creation validation.
     */
    boolean existsByNameIgnoreCase(String name);
    
    /**
     * Find all root categories (categories without parent).
     * Used for displaying main category navigation.
     */
    List<Category> findByParentIsNull();
    
    /**
     * Find all child categories of a parent category.
     * Used for hierarchical category display.
     */
    List<Category> findByParent(Category parent);
    
    /**
     * Find all child categories by parent ID.
     * Used for hierarchical category display.
     */
    List<Category> findByParentId(Long parentId);
    
    /**
     * Find categories by name containing search term (case-insensitive).
     * Used for category search functionality.
     */
    @Query("SELECT c FROM Category c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Category> searchByName(@Param("searchTerm") String searchTerm);
    
    /**
     * Find all categories with their product count.
     * Used for category management and analytics.
     */
    @Query("SELECT c, COUNT(p) FROM Category c LEFT JOIN c.products p GROUP BY c")
    List<Object[]> findCategoriesWithProductCount();
    
    /**
     * Find categories that have products.
     * Used for filtering categories with available products.
     */
    @Query("SELECT DISTINCT c FROM Category c WHERE EXISTS (SELECT p FROM Product p WHERE p.category = c AND p.isActive = true)")
    List<Category> findCategoriesWithActiveProducts();
    
    /**
     * Get category hierarchy path for a given category.
     * Used for breadcrumb navigation and category path display.
     * Note: This is a simplified version - full recursive path would need custom implementation.
     */
    @Query("SELECT c.name FROM Category c WHERE c.id = :categoryId")
    String getCategoryName(@Param("categoryId") Long categoryId);
    
    /**
     * Find direct descendant categories of a parent category.
     * Used for category filtering (simplified version of recursive query).
     */
    @Query("SELECT c FROM Category c WHERE c.parent.id = :parentId")
    List<Category> findDirectDescendants(@Param("parentId") Long parentId);
    
    /**
     * Get category statistics for dashboard.
     * Returns total categories, root categories, and categories with products.
     */
    @Query("SELECT " +
           "COUNT(c) as totalCategories, " +
           "SUM(CASE WHEN c.parent IS NULL THEN 1 ELSE 0 END) as rootCategories, " +
           "COUNT(DISTINCT CASE WHEN SIZE(c.products) > 0 THEN c.id END) as categoriesWithProducts " +
           "FROM Category c")
    Object[] getCategoryStatistics();
    
    /**
     * Find categories ordered by product count.
     * Used for category popularity analysis.
     */
    @Query("SELECT c, COUNT(p) as productCount FROM Category c LEFT JOIN c.products p " +
           "WHERE p.isActive = true OR p IS NULL GROUP BY c ORDER BY productCount DESC")
    List<Object[]> findCategoriesOrderedByProductCount();
    
    /**
     * Find empty categories (categories without products).
     * Used for category cleanup and management.
     */
    @Query("SELECT c FROM Category c WHERE NOT EXISTS (SELECT p FROM Product p WHERE p.category = c AND p.isActive = true)")
    List<Category> findEmptyCategories();
}