package com.ecommerce.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Response DTO for admin dashboard metrics and analytics.
 * Contains comprehensive business metrics and KPIs.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardResponse {
    
    // Overview Metrics
    private Long totalCustomers;
    private Long totalProducts;
    private Long totalOrders;
    private Long completedOrders;
    private Double totalRevenue;
    private Double averageOrderValue;
    private Long totalCategories;
    private Long pendingOrders;
    
    // Recent Activity
    private Long recentOrders;
    private Long newCustomers;
    private Long newProducts;
    private Long recentPendingOrders;
    
    // Inventory Status
    private Long productsInStock;
    private Long outOfStockProducts;
    private Long lowStockProducts;
    private Long totalInventoryUnits;
    
    // Customer Analytics
    private Long customersWithOrders;
    private Double averageOrdersPerCustomer;
    private Double averageSpentPerCustomer;
    
    // Top Products
    private List<TopProductResponse> topProducts;
    
    // Growth Trends
    private List<MonthlyGrowthResponse> monthlyGrowth;
    
    private LocalDateTime generatedAt;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TopProductResponse {
        private Long productId;
        private String productName;
        private Double totalRevenue;
        private Long totalQuantitySold;
        private Long orderCount;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MonthlyGrowthResponse {
        private String month;
        private Long orders;
        private Double revenue;
        private Long newCustomers;
    }
}