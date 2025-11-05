package com.ecommerce.controller;

import com.ecommerce.dto.request.CreateProductRequest;
import com.ecommerce.dto.request.UpdateProductRequest;
import com.ecommerce.dto.response.ApiResponse;
import com.ecommerce.dto.response.PagedResponse;
import com.ecommerce.dto.response.ProductResponse;
import com.ecommerce.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import com.ecommerce.entity.Product;

@RequiredArgsConstructor(onConstructor_ = @Autowired)
@RestController
@RequestMapping("/products")
@Tag(name = "Product Management", description = "Product catalog management including CRUD operations, search, filtering, and variant management")
public class ProductController {
    private final ProductService productService;
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
        summary = "Create a new product",
        description = """
            Create a new product in the catalog with details like name, description, price, and variants.
            Only administrators can create products.
            
            **Required fields:** name, description, price, categoryId
            **Optional fields:** images, sizes, colors, stockQuantity
            """,
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Product creation details",
            required = true,
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = CreateProductRequest.class),
                examples = @ExampleObject(
                    name = "Create Product Example",
                    value = """
                        {
                          "name": "Premium Cotton T-Shirt",
                          "description": "High-quality cotton t-shirt with comfortable fit",
                          "price": 29.99,
                          "categoryId": 1,
                          "stockQuantity": 100,
                          "sizes": ["S", "M", "L", "XL"],
                          "colors": ["White", "Black", "Navy"],
                          "images": []
                        }
                        """
                )
            )
        )
    )
    @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = "bearerAuth")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "201",
            description = "Product created successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ApiResponse.class)
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", ref = "#/components/responses/ValidationError"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", ref = "#/components/responses/UnauthorizedError"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", ref = "#/components/responses/ForbiddenError")
    })
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(@Valid @RequestBody CreateProductRequest request) {
        ProductResponse product = productService.createProduct(request);
        ApiResponse<ProductResponse> response = new ApiResponse<>(true, "Product created successfully", product);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update a product", description = "Update an existing product (Admin only)")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProductRequest request) {
        ProductResponse product = productService.updateProduct(id, request);
        ApiResponse<ProductResponse> response = new ApiResponse<>(true, "Product updated successfully", product);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get product by ID", description = "Retrieve a product by its ID")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(@PathVariable Long id) {
        ProductResponse product = productService.getProductById(id);
        ApiResponse<ProductResponse> response = new ApiResponse<>(true, "Product retrieved successfully", product);
        return ResponseEntity.ok(response);
    }    

    @GetMapping
    @Operation(
        summary = "Get all products",
        description = """
            Retrieve a paginated list of all active products in the catalog.
            Supports sorting by various fields including name, price, createdAt, and stockQuantity.
            
            **Available sort fields:** name, price, createdAt, updatedAt, stockQuantity
            **Sort directions:** asc (ascending), desc (descending)
            """,
        parameters = {
            @io.swagger.v3.oas.annotations.Parameter(
                name = "page",
                description = "Page number (0-based). First page is 0.",
                example = "0",
                schema = @Schema(type = "integer", minimum = "0", defaultValue = "0")
            ),
            @io.swagger.v3.oas.annotations.Parameter(
                name = "size",
                description = "Number of products per page. Maximum allowed is 100.",
                example = "10",
                schema = @Schema(type = "integer", minimum = "1", maximum = "100", defaultValue = "10")
            ),
            @io.swagger.v3.oas.annotations.Parameter(
                name = "sortBy",
                description = "Field to sort by",
                example = "createdAt",
                schema = @Schema(type = "string", allowableValues = {"name", "price", "createdAt", "updatedAt", "stockQuantity"}, defaultValue = "createdAt")
            ),
            @io.swagger.v3.oas.annotations.Parameter(
                name = "sortDir",
                description = "Sort direction",
                example = "desc",
                schema = @Schema(type = "string", allowableValues = {"asc", "desc"}, defaultValue = "desc")
            )
        }
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Products retrieved successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ApiResponse.class),
                examples = @ExampleObject(
                    name = "Products List Response",
                    value = """
                        {
                          "success": true,
                          "message": "Products retrieved successfully",
                          "data": {
                            "content": [
                              {
                                "id": 1,
                                "name": "Premium Cotton T-Shirt",
                                "description": "High-quality cotton t-shirt",
                                "price": 29.99,
                                "stockQuantity": 100,
                                "images": ["http://localhost:8080/api/images/tshirt1.jpg"],
                                "sizes": ["S", "M", "L", "XL"],
                                "colors": ["White", "Black"],
                                "category": {
                                  "id": 1,
                                  "name": "Clothing"
                                },
                                "active": true,
                                "createdAt": "2024-01-15T10:30:00Z"
                              }
                            ],
                            "page": 0,
                            "size": 10,
                            "totalElements": 1,
                            "totalPages": 1,
                            "first": true,
                            "last": true
                          }
                        }
                        """
                )
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", ref = "#/components/responses/ValidationError")
    })
    public ResponseEntity<ApiResponse<PagedResponse<ProductResponse>>> getAllProducts(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(defaultValue = "desc") String sortDir) {
        
        PagedResponse<ProductResponse> products = productService.getAllProducts(page, size, sortBy, sortDir);
        ApiResponse<PagedResponse<ProductResponse>> response = new ApiResponse<>(true, "Products retrieved successfully", products);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/search")
    @Operation(summary = "Search products", description = "Search products by keyword with pagination")
    public ResponseEntity<ApiResponse<PagedResponse<ProductResponse>>> searchProducts(
            @Parameter(description = "Search keyword") @RequestParam String keyword,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(defaultValue = "desc") String sortDir) {
        
        PagedResponse<ProductResponse> products = productService.searchProducts(keyword, page, size, sortBy, sortDir);
        ApiResponse<PagedResponse<ProductResponse>> response = new ApiResponse<>(true, "Products search completed", products);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/category/{categoryId}")
    @Operation(summary = "Get products by category", description = "Retrieve products by category with pagination")
    public ResponseEntity<ApiResponse<PagedResponse<ProductResponse>>> getProductsByCategory(
            @PathVariable Long categoryId,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(defaultValue = "desc") String sortDir) {
        
        PagedResponse<ProductResponse> products = productService.getProductsByCategory(categoryId, page, size, sortBy, sortDir);
        ApiResponse<PagedResponse<ProductResponse>> response = new ApiResponse<>(true, "Products retrieved successfully", products);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/filter")
    @Operation(summary = "Filter products", description = "Filter products by multiple criteria")
    public ResponseEntity<ApiResponse<PagedResponse<ProductResponse>>> filterProducts(
            @Parameter(description = "Category ID") @RequestParam(required = false) Long categoryId,
            @Parameter(description = "Minimum price") @RequestParam(required = false) BigDecimal minPrice,
            @Parameter(description = "Maximum price") @RequestParam(required = false) BigDecimal maxPrice,
            @Parameter(description = "In stock filter") @RequestParam(required = false) Boolean inStock,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(defaultValue = "desc") String sortDir) {
        
        PagedResponse<ProductResponse> products = productService.filterProducts(categoryId, minPrice, maxPrice, inStock, page, size, sortBy, sortDir);
        ApiResponse<PagedResponse<ProductResponse>> response = new ApiResponse<>(true, "Products filtered successfully", products);
        return ResponseEntity.ok(response);
    }    

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a product", description = "Soft delete a product (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        ApiResponse<Void> response = new ApiResponse<>(true, "Product deleted successfully", null);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}/stock")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update product stock", description = "Update product stock quantity (Admin only)")
    public ResponseEntity<ApiResponse<ProductResponse>> updateStock(
            @PathVariable Long id,
            @Parameter(description = "New stock quantity") @RequestParam Integer stockQuantity) {
        
        ProductResponse product = productService.updateStock(id, stockQuantity);
        ApiResponse<ProductResponse> response = new ApiResponse<>(true, "Stock updated successfully", product);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{id}/availability")
    @Operation(summary = "Check product availability", description = "Check if product is available for given quantity")
    public ResponseEntity<ApiResponse<Boolean>> checkAvailability(
            @PathVariable Long id,
            @Parameter(description = "Requested quantity") @RequestParam Integer quantity) {
        
        boolean available = productService.isProductAvailable(id, quantity);
        ApiResponse<Boolean> response = new ApiResponse<>(true, "Availability checked", available);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/low-stock")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get low stock products", description = "Get products with stock below threshold (Admin only)")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getLowStockProducts(
            @Parameter(description = "Stock threshold") @RequestParam(defaultValue = "10") Integer threshold) {
        
        List<ProductResponse> products = productService.getLowStockProducts(threshold);
        ApiResponse<List<ProductResponse>> response = new ApiResponse<>(true, "Low stock products retrieved", products);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/out-of-stock")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get out of stock products", description = "Get products that are out of stock (Admin only)")
    public ResponseEntity<ApiResponse<PagedResponse<ProductResponse>>> getOutOfStockProducts(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size) {
        
        PagedResponse<ProductResponse> products = productService.getOutOfStockProducts(page, size);
        ApiResponse<PagedResponse<ProductResponse>> response = new ApiResponse<>(true, "Out of stock products retrieved", products);
        return ResponseEntity.ok(response);
    }

  // Product Variant Management Endpoints
    
    @PostMapping("/{id}/sizes")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Add size to product", description = "Add a new size variant to a product (Admin only)")
    public ResponseEntity<ApiResponse<ProductResponse>> addSize(
            @PathVariable Long id,
            @Parameter(description = "Size to add") @RequestParam String size) {
        
        ProductResponse product = productService.addSize(id, size);
        ApiResponse<ProductResponse> response = new ApiResponse<>(true, "Size added successfully", product);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}/sizes")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Remove size from product", description = "Remove a size variant from a product (Admin only)")
    public ResponseEntity<ApiResponse<ProductResponse>> removeSize(
            @PathVariable Long id,
            @Parameter(description = "Size to remove") @RequestParam String size) {
        
        ProductResponse product = productService.removeSize(id, size);
        ApiResponse<ProductResponse> response = new ApiResponse<>(true, "Size removed successfully", product);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/{id}/colors")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Add color to product", description = "Add a new color variant to a product (Admin only)")
    public ResponseEntity<ApiResponse<ProductResponse>> addColor(
            @PathVariable Long id,
            @Parameter(description = "Color to add") @RequestParam String color) {
        
        ProductResponse product = productService.addColor(id, color);
        ApiResponse<ProductResponse> response = new ApiResponse<>(true, "Color added successfully", product);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}/colors")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Remove color from product", description = "Remove a color variant from a product (Admin only)")
    public ResponseEntity<ApiResponse<ProductResponse>> removeColor(
            @PathVariable Long id,
            @Parameter(description = "Color to remove") @RequestParam String color) {
        
        ProductResponse product = productService.removeColor(id, color);
        ApiResponse<ProductResponse> response = new ApiResponse<>(true, "Color removed successfully", product);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{id}/variants")
    @Operation(summary = "Get product variants", description = "Get all available sizes and colors for a product")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductVariants(@PathVariable Long id) {
        ProductResponse product = productService.getProductVariants(id);
        ApiResponse<ProductResponse> response = new ApiResponse<>(true, "Product variants retrieved successfully", product);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{id}/variants/availability")
    @Operation(summary = "Check variant availability", description = "Check if specific size and color combination is available")
    public ResponseEntity<ApiResponse<Boolean>> checkVariantAvailability(
            @PathVariable Long id,
            @Parameter(description = "Size variant") @RequestParam(required = false) String size,
            @Parameter(description = "Color variant") @RequestParam(required = false) String color,
            @Parameter(description = "Requested quantity") @RequestParam Integer quantity) {
        
        boolean available = productService.isVariantAvailable(id, size, color, quantity);
        ApiResponse<Boolean> response = new ApiResponse<>(true, "Variant availability checked", available);
        return ResponseEntity.ok(response);
    }


    @Autowired
    private com.ecommerce.util.ImageUploadUtil imageUploadUtil;
    
    @PostMapping("/{id}/images")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Upload product image", description = "Upload an image for a product (Admin only)")
    public ResponseEntity<ApiResponse<ProductResponse>> uploadProductImage(
            @PathVariable Long id,
            @Parameter(description = "Image file") @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        
        // Upload image and get filename
        String filename = imageUploadUtil.uploadImage(file);
        String imageUrl = imageUploadUtil.getImageUrl(filename);
        
        // Get product and add image URL
        Product product = productService.getProductEntityById(id);
        product.addImage(imageUrl);
        
        // Save and return updated product
        ProductResponse updatedProduct = productService.saveProduct(product);
        ApiResponse<ProductResponse> response = new ApiResponse<>(true, "Image uploaded successfully", updatedProduct);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}/images")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Remove product image", description = "Remove an image from a product (Admin only)")
    public ResponseEntity<ApiResponse<ProductResponse>> removeProductImage(
            @PathVariable Long id,
            @Parameter(description = "Image URL to remove") @RequestParam String imageUrl) {
        
        ProductResponse product = productService.removeProductImage(id, imageUrl);
        
        // Extract filename from URL and delete file
        String filename = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
        imageUploadUtil.deleteImage(filename);
        
        ApiResponse<ProductResponse> response = new ApiResponse<>(true, "Image removed successfully", product);
        return ResponseEntity.ok(response);
    }
}