package com.ecommerce.dto.response;

import com.ecommerce.entity.Category;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class CategoryResponse {
    
    private Long id;
    private String name;
    private String description;
    private Long parentId;
    private String parentName;
    private List<CategoryResponse> children;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private long productCount;
    private boolean hasChildren;
    
    // Default constructor
    public CategoryResponse() {}
    
    // Constructor from Category entity
    public CategoryResponse(Category category) {
        this.id = category.getId();
        this.name = category.getName();
        this.description = category.getDescription();
        this.parentId = category.getParent() != null ? category.getParent().getId() : null;
        this.parentName = category.getParent() != null ? category.getParent().getName() : null;
        this.active = category.getActive();
        this.createdAt = category.getCreatedAt();
        this.updatedAt = category.getUpdatedAt();
        this.hasChildren = category.hasChildren();
        
        // Only include children if they exist and are active
        if (category.getChildren() != null && !category.getChildren().isEmpty()) {
            this.children = category.getChildren().stream()
                    .filter(child -> child.getActive())
                    .map(CategoryResponse::new)
                    .collect(Collectors.toList());
        }
        
        // Count active products in this category
        if (category.getProducts() != null) {
            this.productCount = category.getProducts().stream()
                    .filter(product -> product.getActive())
                    .count();
        }
    }
    
    // Constructor for simple category response (without children)
    public CategoryResponse(Category category, boolean includeChildren) {
        this.id = category.getId();
        this.name = category.getName();
        this.description = category.getDescription();
        this.parentId = category.getParent() != null ? category.getParent().getId() : null;
        this.parentName = category.getParent() != null ? category.getParent().getName() : null;
        this.active = category.getActive();
        this.createdAt = category.getCreatedAt();
        this.updatedAt = category.getUpdatedAt();
        this.hasChildren = category.hasChildren();
        
        if (includeChildren && category.getChildren() != null && !category.getChildren().isEmpty()) {
            this.children = category.getChildren().stream()
                    .filter(child -> child.getActive())
                    .map(child -> new CategoryResponse(child, false))
                    .collect(Collectors.toList());
        }
        
        // Count active products in this category
        if (category.getProducts() != null) {
            this.productCount = category.getProducts().stream()
                    .filter(product -> product.getActive())
                    .count();
        }
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public Long getParentId() {
        return parentId;
    }
    
    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }
    
    public String getParentName() {
        return parentName;
    }
    
    public void setParentName(String parentName) {
        this.parentName = parentName;
    }
    
    public List<CategoryResponse> getChildren() {
        return children;
    }
    
    public void setChildren(List<CategoryResponse> children) {
        this.children = children;
    }
    
    public Boolean getActive() {
        return active;
    }
    
    public void setActive(Boolean active) {
        this.active = active;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public long getProductCount() {
        return productCount;
    }
    
    public void setProductCount(long productCount) {
        this.productCount = productCount;
    }
    
    public boolean isHasChildren() {
        return hasChildren;
    }
    
    public void setHasChildren(boolean hasChildren) {
        this.hasChildren = hasChildren;
    }
}