package com.ecommerce.service;

import com.ecommerce.dto.request.CreateProductRequest;
import com.ecommerce.dto.request.UpdateProductRequest;
import com.ecommerce.dto.response.PagedResponse;
import com.ecommerce.dto.response.ProductResponse;
import com.ecommerce.entity.Category;
import com.ecommerce.entity.Product;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.CategoryRepository;
import com.ecommerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.List;
import java.util.logging.Level;
import java.util.stream.Collectors;

@Log
@Service
@Transactional
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    /**
     * Create a new product
     */
    public ProductResponse createProduct(CreateProductRequest request) {
        log.log(Level.INFO, "Creating new product: {}", request.getName());

        // Validate category exists
        Category category = categoryRepository.findByIdAndActiveTrue(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));

        // Validate SKU uniqueness if provided
        if (StringUtils.hasText(request.getSku()) && productRepository.existsBySku(request.getSku())) {
            throw new BadRequestException("Product with SKU '" + request.getSku() + "' already exists");
        }

        // Create product entity
        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setCategory(category);
        product.setSku(request.getSku());
        product.setWeight(request.getWeight());

        // Set collections
        if (request.getImages() != null) {
            product.setImages(request.getImages());
        }
        if (request.getSizes() != null) {
            product.setSizes(request.getSizes());
        }
        if (request.getColors() != null) {
            product.setColors(request.getColors());
        }

        Product savedProduct = productRepository.save(product);
        log.log(Level.INFO, "Product created successfully with ID: {}", savedProduct.getId());

        return new ProductResponse(savedProduct);
    }

    /**
     * Update an existing product
     */
    public ProductResponse updateProduct(Long productId, UpdateProductRequest request) {
        log.log(Level.INFO, "Updating product with ID: {}", productId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        // Update fields if provided
        if (StringUtils.hasText(request.getName())) {
            product.setName(request.getName());
        }

        if (request.getDescription() != null) {
            product.setDescription(request.getDescription());
        }

        if (request.getPrice() != null) {
            product.setPrice(request.getPrice());
        }

        if (request.getStockQuantity() != null) {
            product.setStockQuantity(request.getStockQuantity());
        }

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findByIdAndActiveTrue(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
            product.setCategory(category);
        }

        if (StringUtils.hasText(request.getSku())) {
            // Validate SKU uniqueness
            if (productRepository.existsBySkuAndIdNot(request.getSku(), productId)) {
                throw new BadRequestException("Product with SKU '" + request.getSku() + "' already exists");
            }
            product.setSku(request.getSku());
        }

        if (request.getWeight() != null) {
            product.setWeight(request.getWeight());
        }

        if (request.getActive() != null) {
            product.setActive(request.getActive());
        }

        // Update collections
        if (request.getImages() != null) {
            product.setImages(request.getImages());
        }
        if (request.getSizes() != null) {
            product.setSizes(request.getSizes());
        }
        if (request.getColors() != null) {
            product.setColors(request.getColors());
        }

        Product updatedProduct = productRepository.save(product);
        log.log(Level.INFO, "Product updated successfully: {}", updatedProduct.getId());

        return new ProductResponse(updatedProduct);
    }

    /**
     * Get product by ID
     */
    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long productId) {
        Product product = productRepository.findByIdAndActiveTrue(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        return new ProductResponse(product);
    }

    /**
     * Get all products with pagination
     */
    @Transactional(readOnly = true)
    public PagedResponse<ProductResponse> getAllProducts(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ?
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Product> products = productRepository.findByActiveTrue(pageable);

        List<ProductResponse> productResponses = products.getContent().stream()
                .map(ProductResponse::new)
                .collect(Collectors.toList());

        return new PagedResponse<>(products, productResponses);
    }

    /**
     * Search products by keyword
     */
    @Transactional(readOnly = true)
    public PagedResponse<ProductResponse> searchProducts(String keyword, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ?
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Product> products = productRepository.searchProducts(keyword, pageable);

        List<ProductResponse> productResponses = products.getContent().stream()
                .map(ProductResponse::new)
                .collect(Collectors.toList());

        return new PagedResponse<>(products, productResponses);
    }

    /**
     * Get products by category
     */
    @Transactional(readOnly = true)
    public PagedResponse<ProductResponse> getProductsByCategory(Long categoryId, int page, int size, String sortBy, String sortDir) {
        // Validate category exists
        categoryRepository.findByIdAndActiveTrue(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", categoryId));

        Sort sort = sortDir.equalsIgnoreCase("desc") ?
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Product> products = productRepository.findByCategoryIdAndActiveTrue(categoryId, pageable);

        List<ProductResponse> productResponses = products.getContent().stream()
                .map(ProductResponse::new)
                .collect(Collectors.toList());

        return new PagedResponse<>(products, productResponses);
    }

    /**
     * Filter products with multiple criteria
     */
    @Transactional(readOnly = true)
    public PagedResponse<ProductResponse> filterProducts(Long categoryId, BigDecimal minPrice, BigDecimal maxPrice,
                                                         Boolean inStock, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ?
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Product> products = productRepository.findWithFilters(categoryId, minPrice, maxPrice, inStock, pageable);

        List<ProductResponse> productResponses = products.getContent().stream()
                .map(ProductResponse::new)
                .collect(Collectors.toList());

        return new PagedResponse<>(products, productResponses);
    }

    /**
     * Delete product (soft delete)
     */
    public void deleteProduct(Long productId) {
        log.log(Level.INFO, "Deleting product with ID: {}", productId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        product.setActive(false);
        productRepository.save(product);

        log.log(Level.INFO, "Product soft deleted successfully: {}", productId);
    }

    /**
     * Update product stock quantity
     */
    public ProductResponse updateStock(Long productId, Integer newStockQuantity) {
        log.log(Level.INFO, "Updating stock for product ID: {} to quantity: {}", new Object[]{productId, newStockQuantity});

        if (newStockQuantity < 0) {
            throw new BadRequestException("Stock quantity cannot be negative");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        product.setStockQuantity(newStockQuantity);
        Product updatedProduct = productRepository.save(product);

        log.log(Level.INFO, "Stock updated successfully for product: {}", productId);
        return new ProductResponse(updatedProduct);
    }

    /**
     * Check product availability for given quantity
     */
    @Transactional(readOnly = true)
    public boolean isProductAvailable(Long productId, Integer requestedQuantity) {
        Product product = productRepository.findByIdAndActiveTrue(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        return product.isAvailable(requestedQuantity);
    }

    /**
     * Reduce product stock (for order processing)
     */
    public void reduceStock(Long productId, Integer quantity) {
        log.log(Level.INFO, "Reducing stock for product ID: {} by quantity: {}", new Object[]{productId, quantity});

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        if (!product.isAvailable(quantity)) {
            throw new BadRequestException("Insufficient stock for product: " + product.getName());
        }

        product.setStockQuantity(product.getStockQuantity() - quantity);
        productRepository.save(product);

        log.log(Level.INFO, "Stock reduced successfully for product: {}", productId);
    }

    /**
     * Restore product stock (for order cancellation)
     */
    public void restoreStock(Long productId, Integer quantity) {
        log.log(Level.INFO, "Restoring stock for product ID: {} by quantity: {}", new Object[]{productId, quantity});

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        product.setStockQuantity(product.getStockQuantity() + quantity);
        productRepository.save(product);

        log.log(Level.INFO, "Stock restored successfully for product: {}", productId);
    }

    /**
     * Get low stock products
     */
    @Transactional(readOnly = true)
    public List<ProductResponse> getLowStockProducts(Integer threshold) {
        List<Product> products = productRepository.findByActiveTrueAndStockQuantityLessThan(threshold);
        return products.stream()
                .map(ProductResponse::new)
                .collect(Collectors.toList());
    }

    /**
     * Get out of stock products
     */
    @Transactional(readOnly = true)
    public PagedResponse<ProductResponse> getOutOfStockProducts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("updatedAt").descending());
        Page<Product> products = productRepository.findOutOfStockProducts(pageable);

        List<ProductResponse> productResponses = products.getContent().stream()
                .map(ProductResponse::new)
                .collect(Collectors.toList());

        return new PagedResponse<>(products, productResponses);
    }

    /**
     * Add size to product
     */
    public ProductResponse addSize(Long productId, String size) {
        log.log(Level.INFO, "Adding size '{}' to product ID: {}", new Object[]{size, productId});

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        if (product.getSizes().contains(size)) {
            throw new BadRequestException("Size '" + size + "' already exists for this product");
        }

        product.addSize(size);
        Product updatedProduct = productRepository.save(product);

        log.log(Level.INFO, "Size added successfully to product: {}", productId);
        return new ProductResponse(updatedProduct);
    }

    /**
     * Remove size from product
     */
    public ProductResponse removeSize(Long productId, String size) {
        log.log(Level.INFO, "Removing size '{}' from product ID: {}", new Object[]{size, productId});

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        if (!product.getSizes().contains(size)) {
            throw new BadRequestException("Size '" + size + "' does not exist for this product");
        }

        product.getSizes().remove(size);
        Product updatedProduct = productRepository.save(product);

        log.log(Level.INFO, "Size removed successfully from product: {}", productId);
        return new ProductResponse(updatedProduct);
    }

    /**
     * Add color to product
     */
    public ProductResponse addColor(Long productId, String color) {
        log.log(Level.INFO, "Adding color '{}' to product ID: {}", new Object[]{color, productId});

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        if (product.getColors().contains(color)) {
            throw new BadRequestException("Color '" + color + "' already exists for this product");
        }

        product.addColor(color);
        Product updatedProduct = productRepository.save(product);

        log.log(Level.INFO, "Color added successfully to product: {}", productId);
        return new ProductResponse(updatedProduct);
    }

    /**
     * Remove color from product
     */
    public ProductResponse removeColor(Long productId, String color) {
        log.log(Level.INFO, "Removing color '{}' from product ID: {}", new Object[]{color, productId});

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        if (!product.getColors().contains(color)) {
            throw new BadRequestException("Color '" + color + "' does not exist for this product");
        }

        product.getColors().remove(color);
        Product updatedProduct = productRepository.save(product);

        log.log(Level.INFO, "Color removed successfully from product: {}", productId);
        return new ProductResponse(updatedProduct);
    }

    /**
     * Validate product variant availability (size and color combination)
     */
    @Transactional(readOnly = true)
    public boolean isVariantAvailable(Long productId, String size, String color, Integer quantity) {
        Product product = productRepository.findByIdAndActiveTrue(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        // Check if product has the requested size and color
        boolean hasSize = size == null || product.getSizes().isEmpty() || product.getSizes().contains(size);
        boolean hasColor = color == null || product.getColors().isEmpty() || product.getColors().contains(color);

        if (!hasSize) {
            throw new BadRequestException("Size '" + size + "' is not available for this product");
        }

        if (!hasColor) {
            throw new BadRequestException("Color '" + color + "' is not available for this product");
        }

        return product.isAvailable(quantity);
    }

    /**
     * Get product variants (sizes and colors)
     */
    @Transactional(readOnly = true)
    public ProductResponse getProductVariants(Long productId) {
        Product product = productRepository.findByIdAndActiveTrue(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        return new ProductResponse(product);
    }

    /**
     * Get product entity by ID (for internal use)
     */
    public Product getProductEntityById(Long productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));
    }

    /**
     * Save product entity (for internal use)
     */
    public ProductResponse saveProduct(Product product) {
        Product savedProduct = productRepository.save(product);
        return new ProductResponse(savedProduct);
    }

    /**
     * Remove image from product
     */
    public ProductResponse removeProductImage(Long productId, String imageUrl) {
        log.log(Level.INFO, "Removing image '{}' from product ID: {}", new Object[]{imageUrl, productId});

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        if (!product.getImages().contains(imageUrl)) {
            throw new BadRequestException("Image URL does not exist for this product");
        }

        product.getImages().remove(imageUrl);
        Product updatedProduct = productRepository.save(product);

        log.log(Level.INFO, "Image removed successfully from product: {}", productId);
        return new ProductResponse(updatedProduct);
    }
}