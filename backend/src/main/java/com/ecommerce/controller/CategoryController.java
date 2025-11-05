package com.ecommerce.controller;

import com.ecommerce.dto.request.CreateCategoryRequest;
import com.ecommerce.dto.request.UpdateCategoryRequest;
import com.ecommerce.dto.response.ApiResponse;
import com.ecommerce.dto.response.CategoryResponse;
import com.ecommerce.dto.response.PagedResponse;
import com.ecommerce.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categories")
@Tag(name = "Category Management", description = "Product category management with hierarchical organization support")
public class CategoryController {
    
    @Autowired
    private CategoryService categoryService;
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new category", description = "Create a new product category (Admin only)")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(@Valid @RequestBody CreateCategoryRequest request) {
        CategoryResponse category = categoryService.createCategory(request);
        ApiResponse<CategoryResponse> response = new ApiResponse<>(true, "Category created successfully", category);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update a category", description = "Update an existing category (Admin only)")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCategoryRequest request) {
        CategoryResponse category = categoryService.updateCategory(id, request);
        ApiResponse<CategoryResponse> response = new ApiResponse<>(true, "Category updated successfully", category);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get category by ID", description = "Retrieve a category by its ID")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(@PathVariable Long id) {
        CategoryResponse category = categoryService.getCategoryById(id);
        ApiResponse<CategoryResponse> response = new ApiResponse<>(true, "Category retrieved successfully", category);
        return ResponseEntity.ok(response);
    }    

    @GetMapping
    @Operation(summary = "Get all categories", description = "Retrieve all categories with pagination and sorting")
    public ResponseEntity<ApiResponse<PagedResponse<CategoryResponse>>> getAllCategories(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "name") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(defaultValue = "asc") String sortDir) {
        
        PagedResponse<CategoryResponse> categories = categoryService.getAllCategories(page, size, sortBy, sortDir);
        ApiResponse<PagedResponse<CategoryResponse>> response = new ApiResponse<>(true, "Categories retrieved successfully", categories);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/root")
    @Operation(summary = "Get root categories", description = "Retrieve all root categories (categories without parent)")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getRootCategories() {
        List<CategoryResponse> categories = categoryService.getRootCategories();
        ApiResponse<List<CategoryResponse>> response = new ApiResponse<>(true, "Root categories retrieved successfully", categories);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{parentId}/children")
    @Operation(summary = "Get child categories", description = "Retrieve child categories of a parent category")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getChildCategories(@PathVariable Long parentId) {
        List<CategoryResponse> categories = categoryService.getChildCategories(parentId);
        ApiResponse<List<CategoryResponse>> response = new ApiResponse<>(true, "Child categories retrieved successfully", categories);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/search")
    @Operation(summary = "Search categories", description = "Search categories by name")
    public ResponseEntity<ApiResponse<PagedResponse<CategoryResponse>>> searchCategories(
            @Parameter(description = "Search keyword") @RequestParam String keyword,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size) {
        
        PagedResponse<CategoryResponse> categories = categoryService.searchCategories(keyword, page, size);
        ApiResponse<PagedResponse<CategoryResponse>> response = new ApiResponse<>(true, "Categories search completed", categories);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a category", description = "Soft delete a category (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        ApiResponse<Void> response = new ApiResponse<>(true, "Category deleted successfully", null);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/with-products")
    @Operation(summary = "Get categories with products", description = "Retrieve categories that have active products")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCategoriesWithProducts() {
        List<CategoryResponse> categories = categoryService.getCategoriesWithProducts();
        ApiResponse<List<CategoryResponse>> response = new ApiResponse<>(true, "Categories with products retrieved successfully", categories);
        return ResponseEntity.ok(response);
    }
}