package com.ecommerce.service.impl;

import com.ecommerce.dto.common.PagedResponse;
import com.ecommerce.dto.product.*;
import com.ecommerce.entity.Category;
import com.ecommerce.entity.Product;
import com.ecommerce.entity.ProductVariant;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.exception.ValidationException;
import com.ecommerce.repository.CategoryRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.ProductVariantRepository;
import com.ecommerce.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of ProductService interface.
 * Provides business logic for product management, search, and category operations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ProductServiceImpl implements ProductService {
    
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductVariantRepository productVariantRepository;
    
    @Override
    public PagedResponse<ProductResponse> getAllProducts(int page, int size, Long categoryId, String search,
                                                        BigDecimal minPrice, BigDecimal maxPrice) {
        log.debug("Getting all products with filters - page: {}, size: {}, categoryId: {}, search: {}, minPrice: {}, maxPrice: {}",
                page, size, categoryId, search, minPrice, maxPrice);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Product> productPage;
        
        // Use the advanced search method from repository
        productPage = productRepository.findWithFilters(categoryId, search, minPrice, maxPrice, pageable);
        
        List<ProductResponse> productResponses = productPage.getContent().stream()
                .map(this::convertToProductResponse)
                .collect(Collectors.toList());
        
        return PagedResponse.<ProductResponse>builder()
                .content(productResponses)
                .page(page)
                .size(size)
                .totalElements(productPage.getTotalElements())
                .totalPages(productPage.getTotalPages())
                .first(productPage.isFirst())
                .last(productPage.isLast())
                .hasNext(productPage.hasNext())
                .hasPrevious(productPage.hasPrevious())
                .build();
    }
    
    @Override
    public ProductDetailResponse getProductById(Long id) {
        log.debug("Getting product by id: {}", id);
        
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        
        if (!product.getIsActive()) {
            throw new ResourceNotFoundException("Product", "id", id);
        }
        
        return convertToProductDetailResponse(product);
    }
    
    @Override
    public PagedResponse<ProductResponse> searchProducts(String query, int page, int size) {
        log.debug("Searching products with query: {}, page: {}, size: {}", query, page, size);
        
        if (query == null || query.trim().isEmpty()) {
            return getAllProducts(page, size, null, null, null, null);
        }
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Product> productPage = productRepository.searchByNameOrDescription(query.trim(), pageable);
        
        List<ProductResponse> productResponses = productPage.getContent().stream()
                .map(this::convertToProductResponse)
                .collect(Collectors.toList());
        
        return PagedResponse.<ProductResponse>builder()
                .content(productResponses)
                .page(page)
                .size(size)
                .totalElements(productPage.getTotalElements())
                .totalPages(productPage.getTotalPages())
                .first(productPage.isFirst())
                .last(productPage.isLast())
                .hasNext(productPage.hasNext())
                .hasPrevious(productPage.hasPrevious())
                .build();
    }
    
    @Override
    public List<CategoryResponse> getAllCategories() {
        log.debug("Getting all categories");
        
        List<Category> categories = categoryRepository.findAll();
        return categories.stream()
                .map(this::convertToCategoryResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<CategoryResponse> getRootCategories() {
        log.debug("Getting root categories");
        
        List<Category> rootCategories = categoryRepository.findByParentIsNull();
        return rootCategories.stream()
                .map(this::convertToCategoryResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<CategoryResponse> getCategoriesWithProducts() {
        log.debug("Getting categories with active products");
        
        List<Category> categories = categoryRepository.findCategoriesWithActiveProducts();
        return categories.stream()
                .map(this::convertToCategoryResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public ProductResponse createProduct(CreateProductRequest request) {
        log.debug("Creating new product: {}", request.getName());
        
        // Validate category exists
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
        
        // Create product
        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .category(category)
                .images(request.getImages() != null ? new ArrayList<>(request.getImages()) : new ArrayList<>())
                .isActive(true)
                .variants(new ArrayList<>())
                .build();
        
        Product savedProduct = productRepository.save(product);
        
        // Create variants if provided
        if (request.getVariants() != null && !request.getVariants().isEmpty()) {
            List<ProductVariant> variants = request.getVariants().stream()
                    .map(variantRequest -> createProductVariant(savedProduct, variantRequest))
                    .collect(Collectors.toList());
            
            productVariantRepository.saveAll(variants);
            savedProduct.setVariants(variants);
        }
        
        log.info("Created product with id: {}", savedProduct.getId());
        return convertToProductResponse(savedProduct);
    }
    
    @Override
    @Transactional
    public ProductResponse updateProduct(Long id, UpdateProductRequest request) {
        log.debug("Updating product with id: {}", id);
        
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        
        // Validate category exists
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
        
        // Update product fields
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setCategory(category);
        product.setImages(request.getImages() != null ? new ArrayList<>(request.getImages()) : new ArrayList<>());
        
        if (request.getIsActive() != null) {
            product.setIsActive(request.getIsActive());
        }
        
        Product savedProduct = productRepository.save(product);
        
        // Update variants if provided
        if (request.getVariants() != null) {
            updateProductVariants(savedProduct, request.getVariants());
        }
        
        log.info("Updated product with id: {}", savedProduct.getId());
        return convertToProductResponse(savedProduct);
    }
    
    @Override
    @Transactional
    public void deleteProduct(Long id) {
        log.debug("Deleting product with id: {}", id);
        
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        
        // Soft delete by setting isActive to false
        product.setIsActive(false);
        productRepository.save(product);
        
        log.info("Soft deleted product with id: {}", id);
    }
    
    @Override
    @Transactional
    public ProductResponse updateProductStatus(Long id, UpdateProductStatusRequest request) {
        log.debug("Updating product status - id: {}, isActive: {}", id, request.getIsActive());
        
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        
        product.setIsActive(request.getIsActive());
        Product savedProduct = productRepository.save(product);
        
        log.info("Updated product status - id: {}, isActive: {}", id, request.getIsActive());
        return convertToProductResponse(savedProduct);
    }
    
    @Override
    @Transactional
    public CategoryResponse createCategory(CreateCategoryRequest request) {
        log.debug("Creating new category: {}", request.getName());
        
        // Check if category name already exists
        if (categoryRepository.existsByNameIgnoreCase(request.getName())) {
            throw new ValidationException("Category with name '" + request.getName() + "' already exists");
        }
        
        Category parent = null;
        if (request.getParentId() != null) {
            parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getParentId()));
        }
        
        Category category = Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .parent(parent)
                .children(new ArrayList<>())
                .products(new ArrayList<>())
                .build();
        
        Category savedCategory = categoryRepository.save(category);
        
        log.info("Created category with id: {}", savedCategory.getId());
        return convertToCategoryResponse(savedCategory);
    }
    
    @Override
    @Transactional
    public CategoryResponse updateCategory(Long id, UpdateCategoryRequest request) {
        log.debug("Updating category with id: {}", id);
        
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        
        // Check if new name conflicts with existing categories (excluding current category)
        categoryRepository.findByNameIgnoreCase(request.getName())
                .ifPresent(existingCategory -> {
                    if (!existingCategory.getId().equals(id)) {
                        throw new ValidationException("Category with name '" + request.getName() + "' already exists");
                    }
                });
        
        Category parent = null;
        if (request.getParentId() != null) {
            if (request.getParentId().equals(id)) {
                throw new ValidationException("Category cannot be its own parent");
            }
            parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getParentId()));
        }
        
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setParent(parent);
        
        Category savedCategory = categoryRepository.save(category);
        
        log.info("Updated category with id: {}", savedCategory.getId());
        return convertToCategoryResponse(savedCategory);
    }
    
    @Override
    @Transactional
    public void deleteCategory(Long id) {
        log.debug("Deleting category with id: {}", id);
        
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        
        // Check if category has products
        if (!category.getProducts().isEmpty()) {
            throw new ValidationException("Cannot delete category that contains products");
        }
        
        // Check if category has child categories
        if (!category.getChildren().isEmpty()) {
            throw new ValidationException("Cannot delete category that has child categories");
        }
        
        categoryRepository.delete(category);
        
        log.info("Deleted category with id: {}", id);
    }
    
    // Helper methods for entity to DTO conversion
    
    private ProductResponse convertToProductResponse(Product product) {
        Integer totalInventory = productVariantRepository.calculateTotalInventoryByProductId(product.getId());
        
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .images(product.getImages())
                .category(convertToCategoryResponse(product.getCategory()))
                .isActive(product.getIsActive())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .hasVariants(!product.getVariants().isEmpty())
                .totalInventory(totalInventory != null ? totalInventory : 0)
                .build();
    }
    
    private ProductDetailResponse convertToProductDetailResponse(Product product) {
        List<ProductVariant> variants = productVariantRepository.findByProductId(product.getId());
        List<String> availableSizes = productVariantRepository.findDistinctSizesByProductId(product.getId());
        List<String> availableColors = productVariantRepository.findDistinctColorsByProductId(product.getId());
        Integer totalInventory = productVariantRepository.calculateTotalInventoryByProductId(product.getId());
        
        return ProductDetailResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .images(product.getImages())
                .category(convertToCategoryResponse(product.getCategory()))
                .variants(variants.stream().map(this::convertToProductVariantResponse).collect(Collectors.toList()))
                .isActive(product.getIsActive())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .availableSizes(availableSizes)
                .availableColors(availableColors)
                .totalInventory(totalInventory != null ? totalInventory : 0)
                .build();
    }
    
    private ProductVariantResponse convertToProductVariantResponse(ProductVariant variant) {
        return ProductVariantResponse.builder()
                .id(variant.getId())
                .size(variant.getSize())
                .color(variant.getColor())
                .colorHex(variant.getColorHex())
                .quantity(variant.getQuantity())
                .additionalPrice(variant.getAdditionalPrice())
                .isAvailable(variant.getQuantity() > 0)
                .build();
    }
    
    private CategoryResponse convertToCategoryResponse(Category category) {
        if (category == null) {
            return null;
        }
        
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .parent(category.getParent() != null ? convertToCategoryResponse(category.getParent()) : null)
                .children(category.getChildren().stream()
                        .map(this::convertToCategoryResponse)
                        .collect(Collectors.toList()))
                .productCount(category.getProducts().size())
                .build();
    }
    
    private ProductVariant createProductVariant(Product product, CreateProductVariantRequest request) {
        return ProductVariant.builder()
                .product(product)
                .size(request.getSize())
                .color(request.getColor())
                .colorHex(request.getColorHex())
                .quantity(request.getQuantity())
                .additionalPrice(request.getAdditionalPrice())
                .build();
    }
    
    private void updateProductVariants(Product product, List<UpdateProductVariantRequest> variantRequests) {
        // Get existing variants
        List<ProductVariant> existingVariants = productVariantRepository.findByProductId(product.getId());
        
        // Process variant updates
        List<ProductVariant> updatedVariants = new ArrayList<>();
        
        for (UpdateProductVariantRequest request : variantRequests) {
            if (request.getId() != null) {
                // Update existing variant
                ProductVariant existingVariant = existingVariants.stream()
                        .filter(v -> v.getId().equals(request.getId()))
                        .findFirst()
                        .orElseThrow(() -> new ResourceNotFoundException("ProductVariant", "id", request.getId()));
                
                existingVariant.setSize(request.getSize());
                existingVariant.setColor(request.getColor());
                existingVariant.setColorHex(request.getColorHex());
                existingVariant.setQuantity(request.getQuantity());
                existingVariant.setAdditionalPrice(request.getAdditionalPrice());
                
                updatedVariants.add(existingVariant);
            } else {
                // Create new variant
                ProductVariant newVariant = ProductVariant.builder()
                        .product(product)
                        .size(request.getSize())
                        .color(request.getColor())
                        .colorHex(request.getColorHex())
                        .quantity(request.getQuantity())
                        .additionalPrice(request.getAdditionalPrice())
                        .build();
                
                updatedVariants.add(newVariant);
            }
        }
        
        // Remove variants that are not in the update request
        List<Long> updatedVariantIds = variantRequests.stream()
                .map(UpdateProductVariantRequest::getId)
                .filter(id -> id != null)
                .collect(Collectors.toList());
        
        List<ProductVariant> variantsToDelete = existingVariants.stream()
                .filter(v -> !updatedVariantIds.contains(v.getId()))
                .collect(Collectors.toList());
        
        if (!variantsToDelete.isEmpty()) {
            productVariantRepository.deleteAll(variantsToDelete);
        }
        
        // Save updated variants
        productVariantRepository.saveAll(updatedVariants);
    }
}