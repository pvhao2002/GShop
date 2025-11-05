package com.ecommerce.service;

import com.ecommerce.dto.request.CreateCategoryRequest;
import com.ecommerce.dto.request.UpdateCategoryRequest;
import com.ecommerce.dto.response.CategoryResponse;
import com.ecommerce.dto.response.PagedResponse;
import com.ecommerce.entity.Category;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.CategoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CategoryService {
    
    private static final Logger logger = LoggerFactory.getLogger(CategoryService.class);
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    /**
     * Create a new category
     */
    public CategoryResponse createCategory(CreateCategoryRequest request) {
        logger.info("Creating new category: {}", request.getName());
        
        // Validate name uniqueness
        if (categoryRepository.existsByName(request.getName())) {
            throw new BadRequestException("Category with name '" + request.getName() + "' already exists");
        }
        
        Category category = new Category();
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        
        // Set parent if provided
        if (request.getParentId() != null) {
            Category parent = categoryRepository.findByIdAndActiveTrue(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent Category", "id", request.getParentId()));
            category.setParent(parent);
        }
        
        Category savedCategory = categoryRepository.save(category);
        logger.info("Category created successfully with ID: {}", savedCategory.getId());
        
        return new CategoryResponse(savedCategory, false);
    }   
 
    /**
     * Update an existing category
     */
    public CategoryResponse updateCategory(Long categoryId, UpdateCategoryRequest request) {
        logger.info("Updating category with ID: {}", categoryId);
        
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", categoryId));
        
        // Update fields if provided
        if (StringUtils.hasText(request.getName())) {
            // Validate name uniqueness
            if (categoryRepository.existsByNameAndIdNot(request.getName(), categoryId)) {
                throw new BadRequestException("Category with name '" + request.getName() + "' already exists");
            }
            category.setName(request.getName());
        }
        
        if (request.getDescription() != null) {
            category.setDescription(request.getDescription());
        }
        
        if (request.getParentId() != null) {
            // Prevent circular reference
            if (request.getParentId().equals(categoryId)) {
                throw new BadRequestException("Category cannot be its own parent");
            }
            
            Category parent = categoryRepository.findByIdAndActiveTrue(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent Category", "id", request.getParentId()));
            category.setParent(parent);
        }
        
        if (request.getActive() != null) {
            category.setActive(request.getActive());
        }
        
        Category updatedCategory = categoryRepository.save(category);
        logger.info("Category updated successfully: {}", updatedCategory.getId());
        
        return new CategoryResponse(updatedCategory, false);
    }
    
    /**
     * Get category by ID
     */
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long categoryId) {
        Category category = categoryRepository.findByIdAndActiveTrue(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", categoryId));
        
        return new CategoryResponse(category, true);
    }
    
    /**
     * Get all categories with pagination
     */
    @Transactional(readOnly = true)
    public PagedResponse<CategoryResponse> getAllCategories(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Category> categories = categoryRepository.findByActiveTrue(pageable);
        
        List<CategoryResponse> categoryResponses = categories.getContent().stream()
                .map(category -> new CategoryResponse(category, false))
                .collect(Collectors.toList());
        
        return new PagedResponse<>(categories, categoryResponses);
    } 
   
    /**
     * Get root categories (categories without parent)
     */
    @Transactional(readOnly = true)
    public List<CategoryResponse> getRootCategories() {
        List<Category> rootCategories = categoryRepository.findByParentIsNullAndActiveTrue();
        return rootCategories.stream()
                .map(category -> new CategoryResponse(category, true))
                .collect(Collectors.toList());
    }
    
    /**
     * Get child categories of a parent category
     */
    @Transactional(readOnly = true)
    public List<CategoryResponse> getChildCategories(Long parentId) {
        // Validate parent exists
        categoryRepository.findByIdAndActiveTrue(parentId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", parentId));
        
        List<Category> childCategories = categoryRepository.findByParentIdAndActiveTrue(parentId);
        return childCategories.stream()
                .map(category -> new CategoryResponse(category, false))
                .collect(Collectors.toList());
    }
    
    /**
     * Search categories by name
     */
    @Transactional(readOnly = true)
    public PagedResponse<CategoryResponse> searchCategories(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        Page<Category> categories = categoryRepository.searchActiveByName(keyword, pageable);
        
        List<CategoryResponse> categoryResponses = categories.getContent().stream()
                .map(category -> new CategoryResponse(category, false))
                .collect(Collectors.toList());
        
        return new PagedResponse<>(categories, categoryResponses);
    }
    
    /**
     * Delete category (soft delete)
     */
    public void deleteCategory(Long categoryId) {
        logger.info("Deleting category with ID: {}", categoryId);
        
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", categoryId));
        
        // Check if category has active products
        long productCount = categoryRepository.countActiveProductsInCategory(categoryId);
        if (productCount > 0) {
            throw new BadRequestException("Cannot delete category with active products. Move or delete products first.");
        }
        
        // Check if category has active children
        if (categoryRepository.hasChildren(categoryId)) {
            throw new BadRequestException("Cannot delete category with child categories. Delete child categories first.");
        }
        
        category.setActive(false);
        categoryRepository.save(category);
        
        logger.info("Category soft deleted successfully: {}", categoryId);
    }
    
    /**
     * Get categories with active products
     */
    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategoriesWithProducts() {
        List<Category> categories = categoryRepository.findCategoriesWithActiveProducts();
        return categories.stream()
                .map(category -> new CategoryResponse(category, false))
                .collect(Collectors.toList());
    }
}