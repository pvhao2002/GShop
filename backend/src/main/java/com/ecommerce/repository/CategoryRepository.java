package com.ecommerce.repository;

import com.ecommerce.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    // Basic queries
    List<Category> findByActiveTrue();
    
    Page<Category> findByActiveTrue(Pageable pageable);
    
    Optional<Category> findByIdAndActiveTrue(Long id);
    
    // Hierarchical queries
    List<Category> findByParentIsNull(); // Root categories
    
    List<Category> findByParentIsNullAndActiveTrue(); // Active root categories
    
    List<Category> findByParentId(Long parentId);
    
    List<Category> findByParentIdAndActiveTrue(Long parentId);
    
    @Query("SELECT c FROM Category c WHERE c.parent = :parent")
    List<Category> findByParent(@Param("parent") Category parent);
    
    @Query("SELECT c FROM Category c WHERE c.parent = :parent AND c.active = true")
    List<Category> findByParentAndActiveTrue(@Param("parent") Category parent);
    
    // Check if category has children
    @Query("SELECT COUNT(c) > 0 FROM Category c WHERE c.parent.id = :categoryId")
    boolean hasChildren(@Param("categoryId") Long categoryId);
    
    @Query("SELECT COUNT(c) FROM Category c WHERE c.parent.id = :categoryId")
    long countChildren(@Param("categoryId") Long categoryId);
    
    // Search queries
    @Query("SELECT c FROM Category c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Category> searchByName(@Param("keyword") String keyword, Pageable pageable);
    
    @Query("SELECT c FROM Category c WHERE c.active = true AND " +
           "LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Category> searchActiveByName(@Param("keyword") String keyword, Pageable pageable);
    
    // Name-based queries
    Optional<Category> findByName(String name);
    
    Optional<Category> findByNameAndActiveTrue(String name);
    
    boolean existsByName(String name);
    
    boolean existsByNameAndIdNot(String name, Long id);
    
    // Category tree queries
    @Query("SELECT c FROM Category c WHERE c.parent IS NULL ORDER BY c.name")
    List<Category> findRootCategoriesOrderByName();
    
    @Query("SELECT c FROM Category c WHERE c.parent.id = :parentId ORDER BY c.name")
    List<Category> findChildrenOrderByName(@Param("parentId") Long parentId);
    
    // Product count queries
    @Query("SELECT COUNT(p) FROM Product p WHERE p.category.id = :categoryId AND p.active = true")
    long countActiveProductsInCategory(@Param("categoryId") Long categoryId);
    
    @Query("SELECT c FROM Category c WHERE c.active = true AND " +
           "(SELECT COUNT(p) FROM Product p WHERE p.category = c AND p.active = true) > 0")
    List<Category> findCategoriesWithActiveProducts();
}