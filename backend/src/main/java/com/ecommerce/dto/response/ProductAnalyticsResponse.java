package com.ecommerce.dto.response;

import java.math.BigDecimal;
import java.util.List;

public class ProductAnalyticsResponse {
    
    private List<TopSellingProduct> topSellingProducts;
    private List<CategoryPerformance> categoryPerformance;
    private InventoryStats inventoryStats;
    private Long totalProducts;
    private Long activeProducts;
    
    public ProductAnalyticsResponse() {}
    
    public ProductAnalyticsResponse(List<TopSellingProduct> topSellingProducts,
                                  List<CategoryPerformance> categoryPerformance,
                                  InventoryStats inventoryStats,
                                  Long totalProducts, Long activeProducts) {
        this.topSellingProducts = topSellingProducts;
        this.categoryPerformance = categoryPerformance;
        this.inventoryStats = inventoryStats;
        this.totalProducts = totalProducts;
        this.activeProducts = activeProducts;
    }
    
    // Getters and Setters
    public List<TopSellingProduct> getTopSellingProducts() {
        return topSellingProducts;
    }
    
    public void setTopSellingProducts(List<TopSellingProduct> topSellingProducts) {
        this.topSellingProducts = topSellingProducts;
    }
    
    public List<CategoryPerformance> getCategoryPerformance() {
        return categoryPerformance;
    }
    
    public void setCategoryPerformance(List<CategoryPerformance> categoryPerformance) {
        this.categoryPerformance = categoryPerformance;
    }
    
    public InventoryStats getInventoryStats() {
        return inventoryStats;
    }
    
    public void setInventoryStats(InventoryStats inventoryStats) {
        this.inventoryStats = inventoryStats;
    }
    
    public Long getTotalProducts() {
        return totalProducts;
    }
    
    public void setTotalProducts(Long totalProducts) {
        this.totalProducts = totalProducts;
    }
    
    public Long getActiveProducts() {
        return activeProducts;
    }
    
    public void setActiveProducts(Long activeProducts) {
        this.activeProducts = activeProducts;
    }
    
    // Inner classes for nested data
    public static class TopSellingProduct {
        private Long productId;
        private String productName;
        private Long totalSold;
        private BigDecimal totalRevenue;
        private BigDecimal averagePrice;
        
        public TopSellingProduct() {}
        
        public TopSellingProduct(Long productId, String productName, Long totalSold, 
                               BigDecimal totalRevenue, BigDecimal averagePrice) {
            this.productId = productId;
            this.productName = productName;
            this.totalSold = totalSold;
            this.totalRevenue = totalRevenue;
            this.averagePrice = averagePrice;
        }
        
        public Long getProductId() {
            return productId;
        }
        
        public void setProductId(Long productId) {
            this.productId = productId;
        }
        
        public String getProductName() {
            return productName;
        }
        
        public void setProductName(String productName) {
            this.productName = productName;
        }
        
        public Long getTotalSold() {
            return totalSold;
        }
        
        public void setTotalSold(Long totalSold) {
            this.totalSold = totalSold;
        }
        
        public BigDecimal getTotalRevenue() {
            return totalRevenue;
        }
        
        public void setTotalRevenue(BigDecimal totalRevenue) {
            this.totalRevenue = totalRevenue;
        }
        
        public BigDecimal getAveragePrice() {
            return averagePrice;
        }
        
        public void setAveragePrice(BigDecimal averagePrice) {
            this.averagePrice = averagePrice;
        }
    }
    
    public static class CategoryPerformance {
        private Long categoryId;
        private String categoryName;
        private Long productCount;
        private Long totalSold;
        private BigDecimal totalRevenue;
        
        public CategoryPerformance() {}
        
        public CategoryPerformance(Long categoryId, String categoryName, Long productCount,
                                 Long totalSold, BigDecimal totalRevenue) {
            this.categoryId = categoryId;
            this.categoryName = categoryName;
            this.productCount = productCount;
            this.totalSold = totalSold;
            this.totalRevenue = totalRevenue;
        }
        
        public Long getCategoryId() {
            return categoryId;
        }
        
        public void setCategoryId(Long categoryId) {
            this.categoryId = categoryId;
        }
        
        public String getCategoryName() {
            return categoryName;
        }
        
        public void setCategoryName(String categoryName) {
            this.categoryName = categoryName;
        }
        
        public Long getProductCount() {
            return productCount;
        }
        
        public void setProductCount(Long productCount) {
            this.productCount = productCount;
        }
        
        public Long getTotalSold() {
            return totalSold;
        }
        
        public void setTotalSold(Long totalSold) {
            this.totalSold = totalSold;
        }
        
        public BigDecimal getTotalRevenue() {
            return totalRevenue;
        }
        
        public void setTotalRevenue(BigDecimal totalRevenue) {
            this.totalRevenue = totalRevenue;
        }
    }
    
    public static class InventoryStats {
        private Long inStockProducts;
        private Long outOfStockProducts;
        private Long lowStockProducts;
        private Integer lowStockThreshold;
        
        public InventoryStats() {}
        
        public InventoryStats(Long inStockProducts, Long outOfStockProducts, 
                            Long lowStockProducts, Integer lowStockThreshold) {
            this.inStockProducts = inStockProducts;
            this.outOfStockProducts = outOfStockProducts;
            this.lowStockProducts = lowStockProducts;
            this.lowStockThreshold = lowStockThreshold;
        }
        
        public Long getInStockProducts() {
            return inStockProducts;
        }
        
        public void setInStockProducts(Long inStockProducts) {
            this.inStockProducts = inStockProducts;
        }
        
        public Long getOutOfStockProducts() {
            return outOfStockProducts;
        }
        
        public void setOutOfStockProducts(Long outOfStockProducts) {
            this.outOfStockProducts = outOfStockProducts;
        }
        
        public Long getLowStockProducts() {
            return lowStockProducts;
        }
        
        public void setLowStockProducts(Long lowStockProducts) {
            this.lowStockProducts = lowStockProducts;
        }
        
        public Integer getLowStockThreshold() {
            return lowStockThreshold;
        }
        
        public void setLowStockThreshold(Integer lowStockThreshold) {
            this.lowStockThreshold = lowStockThreshold;
        }
    }
}