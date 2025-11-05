package com.ecommerce.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class DashboardStatsResponse {
    
    private Long totalOrders;
    private Long totalCustomers;
    private Long totalProducts;
    private BigDecimal totalRevenue;
    private BigDecimal averageOrderValue;
    private Long pendingOrders;
    private Long completedOrders;
    private Long lowStockProducts;
    private Long outOfStockProducts;
    private LocalDateTime lastUpdated;
    
    public DashboardStatsResponse() {
        this.lastUpdated = LocalDateTime.now();
    }
    
    public DashboardStatsResponse(Long totalOrders, Long totalCustomers, Long totalProducts, 
                                BigDecimal totalRevenue, BigDecimal averageOrderValue,
                                Long pendingOrders, Long completedOrders, 
                                Long lowStockProducts, Long outOfStockProducts) {
        this.totalOrders = totalOrders;
        this.totalCustomers = totalCustomers;
        this.totalProducts = totalProducts;
        this.totalRevenue = totalRevenue;
        this.averageOrderValue = averageOrderValue;
        this.pendingOrders = pendingOrders;
        this.completedOrders = completedOrders;
        this.lowStockProducts = lowStockProducts;
        this.outOfStockProducts = outOfStockProducts;
        this.lastUpdated = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getTotalOrders() {
        return totalOrders;
    }
    
    public void setTotalOrders(Long totalOrders) {
        this.totalOrders = totalOrders;
    }
    
    public Long getTotalCustomers() {
        return totalCustomers;
    }
    
    public void setTotalCustomers(Long totalCustomers) {
        this.totalCustomers = totalCustomers;
    }
    
    public Long getTotalProducts() {
        return totalProducts;
    }
    
    public void setTotalProducts(Long totalProducts) {
        this.totalProducts = totalProducts;
    }
    
    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }
    
    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }
    
    public BigDecimal getAverageOrderValue() {
        return averageOrderValue;
    }
    
    public void setAverageOrderValue(BigDecimal averageOrderValue) {
        this.averageOrderValue = averageOrderValue;
    }
    
    public Long getPendingOrders() {
        return pendingOrders;
    }
    
    public void setPendingOrders(Long pendingOrders) {
        this.pendingOrders = pendingOrders;
    }
    
    public Long getCompletedOrders() {
        return completedOrders;
    }
    
    public void setCompletedOrders(Long completedOrders) {
        this.completedOrders = completedOrders;
    }
    
    public Long getLowStockProducts() {
        return lowStockProducts;
    }
    
    public void setLowStockProducts(Long lowStockProducts) {
        this.lowStockProducts = lowStockProducts;
    }
    
    public Long getOutOfStockProducts() {
        return outOfStockProducts;
    }
    
    public void setOutOfStockProducts(Long outOfStockProducts) {
        this.outOfStockProducts = outOfStockProducts;
    }
    
    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }
    
    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
}