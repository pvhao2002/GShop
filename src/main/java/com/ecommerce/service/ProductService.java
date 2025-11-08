package com.ecommerce.service;

import com.ecommerce.dto.common.PagedResponse;
import com.ecommerce.dto.product.*;
import com.ecommerce.entity.Product;

import java.math.BigDecimal;
import java.util.List;

/**
 * Service interface for product management operations.
 * Provides methods for product retrieval, search, and category management.
 */
public interface ProductService {
    List<ProductResponse> topTrendingProducts();
    List<ProductResponse> getFlashSaleProducts();
    List<ProductResponse> top20NewProducts();
    // Public product operations
    PagedResponse<ProductResponse> getAllProducts(int page, int size, Long categoryId, String search, 
                                                 BigDecimal minPrice, BigDecimal maxPrice);
    
    ProductDetailResponse getProductById(Long id);
    
    PagedResponse<ProductResponse> searchProducts(String query, int page, int size);
    
    List<CategoryResponse> getAllCategories();
    
    List<CategoryResponse> getCategoriesWithProducts();
    
    // Admin product operations
    ProductResponse createProduct(CreateProductRequest request);
    
    ProductResponse updateProduct(Long id, UpdateProductRequest request);
    
    void deleteProduct(Long id);
    
    ProductResponse updateProductStatus(Long id, UpdateProductStatusRequest request);
    
    // Category management operations
    CategoryResponse createCategory(CreateCategoryRequest request);
    
    CategoryResponse updateCategory(Long id, UpdateCategoryRequest request);
    
    void deleteCategory(Long id);
}