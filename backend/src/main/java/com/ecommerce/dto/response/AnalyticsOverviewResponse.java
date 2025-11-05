package com.ecommerce.dto.response;

import java.time.LocalDateTime;

public class AnalyticsOverviewResponse {
    
    private DashboardStatsResponse dashboardStats;
    private SalesAnalyticsResponse salesAnalytics;
    private ProductAnalyticsResponse productAnalytics;
    private UserAnalyticsResponse userAnalytics;
    private LocalDateTime periodStart;
    private LocalDateTime periodEnd;
    private LocalDateTime generatedAt;
    
    public AnalyticsOverviewResponse() {
        this.generatedAt = LocalDateTime.now();
    }
    
    public AnalyticsOverviewResponse(DashboardStatsResponse dashboardStats,
                                   SalesAnalyticsResponse salesAnalytics,
                                   ProductAnalyticsResponse productAnalytics,
                                   UserAnalyticsResponse userAnalytics,
                                   LocalDateTime periodStart,
                                   LocalDateTime periodEnd) {
        this.dashboardStats = dashboardStats;
        this.salesAnalytics = salesAnalytics;
        this.productAnalytics = productAnalytics;
        this.userAnalytics = userAnalytics;
        this.periodStart = periodStart;
        this.periodEnd = periodEnd;
        this.generatedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public DashboardStatsResponse getDashboardStats() {
        return dashboardStats;
    }
    
    public void setDashboardStats(DashboardStatsResponse dashboardStats) {
        this.dashboardStats = dashboardStats;
    }
    
    public SalesAnalyticsResponse getSalesAnalytics() {
        return salesAnalytics;
    }
    
    public void setSalesAnalytics(SalesAnalyticsResponse salesAnalytics) {
        this.salesAnalytics = salesAnalytics;
    }
    
    public ProductAnalyticsResponse getProductAnalytics() {
        return productAnalytics;
    }
    
    public void setProductAnalytics(ProductAnalyticsResponse productAnalytics) {
        this.productAnalytics = productAnalytics;
    }
    
    public UserAnalyticsResponse getUserAnalytics() {
        return userAnalytics;
    }
    
    public void setUserAnalytics(UserAnalyticsResponse userAnalytics) {
        this.userAnalytics = userAnalytics;
    }
    
    public LocalDateTime getPeriodStart() {
        return periodStart;
    }
    
    public void setPeriodStart(LocalDateTime periodStart) {
        this.periodStart = periodStart;
    }
    
    public LocalDateTime getPeriodEnd() {
        return periodEnd;
    }
    
    public void setPeriodEnd(LocalDateTime periodEnd) {
        this.periodEnd = periodEnd;
    }
    
    public LocalDateTime getGeneratedAt() {
        return generatedAt;
    }
    
    public void setGeneratedAt(LocalDateTime generatedAt) {
        this.generatedAt = generatedAt;
    }
}