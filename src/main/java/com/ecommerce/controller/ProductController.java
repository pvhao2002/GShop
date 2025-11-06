package com.ecommerce.controller;

import com.ecommerce.dto.common.PagedResponse;
import com.ecommerce.dto.product.CategoryResponse;
import com.ecommerce.dto.product.ProductDetailResponse;
import com.ecommerce.dto.product.ProductResponse;
import com.ecommerce.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * REST Controller for public product endpoints.
 * Provides endpoints for product browsing, search, and category listing.
 * These endpoints are accessible without authentication.
 */
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Slf4j
public class ProductController {
    
    private final ProductService productService;
    
    /**
     * Get all products with optional filtering and pagination.
     * Supports filtering by category, search term, and price range.
     * 
     * @param page Page number (0-based)
     * @param size Page size
     * @param category Category ID for filtering
     * @param search Search term for product name/description
     * @param minPrice Minimum price filter
     * @param maxPrice Maximum price filter
     * @return Paginated list of products
     */
    @GetMapping
    public ResponseEntity<PagedResponse<ProductResponse>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice) {
        
        log.debug("GET /api/products - page: {}, size: {}, category: {}, search: {}, minPrice: {}, maxPrice: {}",
                page, size, category, search, minPrice, maxPrice);
        
        // Validate pagination parameters
        if (page < 0) {
            page = 0;
        }
        if (size <= 0 || size > 100) {
            size = 20;
        }
        
        PagedResponse<ProductResponse> products = productService.getAllProducts(
                page, size, category, search, minPrice, maxPrice);
        
        log.debug("Retrieved {} products for page {}", products.getContent().size(), page);
        return ResponseEntity.ok(products);
    }
    
    /**
     * Get detailed information about a specific product.
     * Includes product variants, available sizes/colors, and inventory information.
     * 
     * @param id Product ID
     * @return Detailed product information
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProductDetailResponse> getProductById(@PathVariable Long id) {
        log.debug("GET /api/products/{}", id);
        
        ProductDetailResponse product = productService.getProductById(id);
        
        log.debug("Retrieved product: {}", product.getName());
        return ResponseEntity.ok(product);
    }
    
    /**
     * Search products by name or description.
     * Performs case-insensitive search across product names and descriptions.
     * 
     * @param query Search query
     * @param page Page number (0-based)
     * @param size Page size
     * @return Paginated search results
     */
    @GetMapping("/search")
    public ResponseEntity<PagedResponse<ProductResponse>> searchProducts(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        log.debug("GET /api/products/search - query: {}, page: {}, size: {}", query, page, size);
        
        // Validate pagination parameters
        if (page < 0) {
            page = 0;
        }
        if (size <= 0 || size > 100) {
            size = 20;
        }
        
        PagedResponse<ProductResponse> searchResults = productService.searchProducts(query, page, size);
        
        log.debug("Found {} products matching query: {}", searchResults.getTotalElements(), query);
        return ResponseEntity.ok(searchResults);
    }
    
    /**
     * Get all product categories.
     * Returns hierarchical category structure with product counts.
     * 
     * @return List of all categories
     */
    @GetMapping("/categories")
    public ResponseEntity<List<CategoryResponse>> getAllCategories() {
        log.debug("GET /api/products/categories");
        
        List<CategoryResponse> categories = productService.getAllCategories();
        
        log.debug("Retrieved {} categories", categories.size());
        return ResponseEntity.ok(categories);
    }
    
    /**
     * Get root categories (categories without parent).
     * Useful for main navigation menu.
     * 
     * @return List of root categories
     */
    @GetMapping("/categories/root")
    public ResponseEntity<List<CategoryResponse>> getRootCategories() {
        log.debug("GET /api/products/categories/root");
        
        List<CategoryResponse> rootCategories = productService.getRootCategories();
        
        log.debug("Retrieved {} root categories", rootCategories.size());
        return ResponseEntity.ok(rootCategories);
    }
    
    /**
     * Get categories that have active products.
     * Useful for filtering out empty categories in navigation.
     * 
     * @return List of categories with products
     */
    @GetMapping("/categories/with-products")
    public ResponseEntity<List<CategoryResponse>> getCategoriesWithProducts() {
        log.debug("GET /api/products/categories/with-products");
        
        List<CategoryResponse> categories = productService.getCategoriesWithProducts();
        
        log.debug("Retrieved {} categories with products", categories.size());
        return ResponseEntity.ok(categories);
    }
}