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
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.atomic.AtomicReference;
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
    public List<ProductResponse> topTrendingProducts() {
        Pageable pageable = PageRequest.of(0, 20);
        var productPage = productRepository.findTrendingProducts(pageable);

        // Lấy danh sách ID để load toàn bộ thông tin (bao gồm variant, category...)
        List<Long> ids = productPage
                .stream()
                .map(Product::getId)
                .collect(Collectors.toList());

        List<Product> products = productRepository.findAllByIdIn(ids);

        List<ProductResponse> productResponses = productPage
                .stream()
                .map(p -> convertToProductResponse(p, products))
                .collect(Collectors.toList());

        log.info("Fetched {} newest products", productResponses.size());
        return productResponses;
    }

    @Override
    public List<ProductResponse> getFlashSaleProducts() {
        var productPage = productRepository.findTop20ByIsActiveTrueOrderByPrice();

        // Lấy danh sách ID để load toàn bộ thông tin (bao gồm variant, category...)
        List<Long> ids = productPage
                .stream()
                .map(Product::getId)
                .collect(Collectors.toList());

        List<Product> products = productRepository.findAllByIdIn(ids);

        List<ProductResponse> productResponses = productPage
                .stream()
                .map(p -> convertToProductResponse(p, products))
                .collect(Collectors.toList());

        log.info("Fetched {} newest products", productResponses.size());
        return productResponses;
    }

    @Override
    public List<ProductResponse> top20NewProducts() {
        var productPage = productRepository.findTop20ByIsActiveTrueOrderByCreatedAtDesc();

        // Lấy danh sách ID để load toàn bộ thông tin (bao gồm variant, category...)
        List<Long> ids = productPage
                .stream()
                .map(Product::getId)
                .collect(Collectors.toList());

        List<Product> products = productRepository.findAllByIdIn(ids);

        List<ProductResponse> productResponses = productPage
                .stream()
                .map(p -> convertToProductResponse(p, products))
                .collect(Collectors.toList());

        log.info("Fetched {} newest products", productResponses.size());
        return productResponses;
    }

    @Override
    public PagedResponse<ProductResponse> getAllProducts(int page, int size, Long categoryId, String search,
                                                        BigDecimal minPrice, BigDecimal maxPrice) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Product> productPage;
        
        // Use the advanced search method from repository
        productPage = productRepository.findWithFilters(categoryId, search, minPrice, maxPrice, pageable);
        List<Product> products = productRepository.findAllByIdIn(productPage.getContent().stream().map(Product::getId).collect(Collectors.toList()));

        List<ProductResponse> productResponses = productPage.getContent().stream()
                .map(e -> convertToProductResponse(e, products))
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
        var products = productRepository.findAllByIdIn(productPage.getContent().stream().map(Product::getId).collect(Collectors.toList()));
        List<ProductResponse> productResponses = productPage.getContent().stream()
                .map(e -> convertToProductResponse(e, products))
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
    public List<CategoryResponse> getCategoriesWithProducts() {
        List<Category> categories = categoryRepository.findCategoriesWithActiveProducts();
        return categories.stream()
                .map(this::convertToCategoryResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public ProductResponse createProduct(CreateProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .category(category)
                .images(new HashSet<>(request.getImages()))
                .isActive(true)
                .variants(new HashSet<>())
                .build();
        
        Product savedProduct = productRepository.save(product);
        if (request.getVariants() != null && !request.getVariants().isEmpty()) {
            var variants = request.getVariants().stream()
                    .map(variantRequest -> createProductVariant(savedProduct, variantRequest))
                    .collect(Collectors.toSet());
            
            productVariantRepository.saveAll(variants);
            savedProduct.setVariants(variants);
        }
        return convertToProductResponse(savedProduct, List.of());
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
        product.setImages(request.getImages() != null ? new HashSet<>(request.getImages()) : new HashSet<>());
        
        if (request.getIsActive() != null) {
            product.setIsActive(request.getIsActive());
        }
        
        Product savedProduct = productRepository.save(product);
        
        // Update variants if provided
        if (request.getVariants() != null) {
            updateProductVariants(savedProduct, request.getVariants());
        }
        
        log.info("Updated product with id: {}", savedProduct.getId());
        return convertToProductResponse(savedProduct, List.of());
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
        return convertToProductResponse(savedProduct, List.of());
    }
    
    @Override
    @Transactional
    public CategoryResponse createCategory(CreateCategoryRequest request) {
        // Check if category name already exists
        if (categoryRepository.existsByNameIgnoreCase(request.getName())) {
            throw new ValidationException("Category with name '" + request.getName() + "' already exists");
        }

        Category category = Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();
        
        Category savedCategory = categoryRepository.save(category);
        
        log.info("Created category with id: {}", savedCategory.getId());
        return convertToCategoryResponse(savedCategory);
    }
    
    @Override
    @Transactional
    public CategoryResponse updateCategory(Long id, UpdateCategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        
        categoryRepository.findByNameIgnoreCase(request.getName())
                .ifPresent(existingCategory -> {
                    if (!existingCategory.getId().equals(id)) {
                        throw new ValidationException("Category with name '" + request.getName() + "' already exists");
                    }
                });

        category.setName(request.getName());
        category.setDescription(request.getDescription());

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

        categoryRepository.delete(category);
        
        log.info("Deleted category with id: {}", id);
    }
    
    // Helper methods for entity to DTO conversion
    
    private ProductResponse convertToProductResponse(Product product, List<Product> products) {
        Integer totalInventory = productVariantRepository.calculateTotalInventoryByProductId(product.getId());
        var p = products.stream().filter(f -> f.getId().equals(product.getId())).findFirst();
        AtomicReference<List<String>> images = new AtomicReference<>();
        p.ifPresent(item -> {
            images.set(List.copyOf(item.getImages()));
        });
        var hasVariants = productVariantRepository.existsByProduct(product);

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .images(images.get())
                .category(convertToCategoryResponse(product.getCategory()))
                .isActive(product.getIsActive())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .hasVariants(hasVariants)
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
                .images(product.getImages().stream().toList())
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
                .filter(Objects::nonNull)
                .toList();
        
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