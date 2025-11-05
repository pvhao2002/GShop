package com.ecommerce.controller;

import com.ecommerce.dto.response.*;
import com.ecommerce.service.StatisticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/statistics")
@Tag(name = "Analytics & Statistics", description = "Business intelligence and analytics dashboard for administrators")
@SecurityRequirement(name = "bearerAuth")
public class StatisticsController {
    
    private final StatisticsService statisticsService;
    
    @Autowired
    public StatisticsController(StatisticsService statisticsService) {
        this.statisticsService = statisticsService;
    }
    
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get dashboard statistics", 
               description = "Retrieve key metrics for the admin dashboard including orders, customers, products, and revenue")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Dashboard statistics retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin role required")
    })
    public ResponseEntity<com.ecommerce.dto.response.ApiResponse<DashboardStatsResponse>> getDashboardStats() {
        DashboardStatsResponse stats = statisticsService.getDashboardStats();
        return ResponseEntity.ok(new com.ecommerce.dto.response.ApiResponse<>(true, "Dashboard statistics retrieved successfully", stats));
    }
    
    @GetMapping("/sales")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get sales analytics", 
               description = "Retrieve sales analytics including daily/monthly trends, revenue, and payment method statistics")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Sales analytics retrieved successfully"),
        @ApiResponse(responseCode = "400", description = "Bad Request - Invalid date parameters"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin role required")
    })
    public ResponseEntity<com.ecommerce.dto.response.ApiResponse<SalesAnalyticsResponse>> getSalesAnalytics(
            @Parameter(description = "Start date for analytics (ISO format: yyyy-MM-dd'T'HH:mm:ss)")
            @RequestParam(required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            
            @Parameter(description = "End date for analytics (ISO format: yyyy-MM-dd'T'HH:mm:ss)")
            @RequestParam(required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        // Use default date range if not provided (last 30 days)
        if (startDate == null || endDate == null) {
            LocalDateTime[] defaultRange = statisticsService.getDefaultDateRange();
            startDate = defaultRange[0];
            endDate = defaultRange[1];
        }
        
        SalesAnalyticsResponse analytics = statisticsService.getSalesAnalytics(startDate, endDate);
        return ResponseEntity.ok(new com.ecommerce.dto.response.ApiResponse<>(true, "Sales analytics retrieved successfully", analytics));
    }
    
    @GetMapping("/sales/current-month")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get current month sales analytics", 
               description = "Retrieve sales analytics for the current month")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Current month sales analytics retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin role required")
    })
    public ResponseEntity<com.ecommerce.dto.response.ApiResponse<SalesAnalyticsResponse>> getCurrentMonthSalesAnalytics() {
        LocalDateTime[] monthRange = statisticsService.getCurrentMonthDateRange();
        SalesAnalyticsResponse analytics = statisticsService.getSalesAnalytics(monthRange[0], monthRange[1]);
        return ResponseEntity.ok(new com.ecommerce.dto.response.ApiResponse<>(true, "Current month sales analytics retrieved successfully", analytics));
    }
    
    @GetMapping("/sales/current-year")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get current year sales analytics", 
               description = "Retrieve sales analytics for the current year")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Current year sales analytics retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin role required")
    })
    public ResponseEntity<com.ecommerce.dto.response.ApiResponse<SalesAnalyticsResponse>> getCurrentYearSalesAnalytics() {
        LocalDateTime[] yearRange = statisticsService.getCurrentYearDateRange();
        SalesAnalyticsResponse analytics = statisticsService.getSalesAnalytics(yearRange[0], yearRange[1]);
        return ResponseEntity.ok(new com.ecommerce.dto.response.ApiResponse<>(true, "Current year sales analytics retrieved successfully", analytics));
    }
    
    @GetMapping("/products")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get product analytics", 
               description = "Retrieve product performance analytics including top sellers, category performance, and inventory stats")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Product analytics retrieved successfully"),
        @ApiResponse(responseCode = "400", description = "Bad Request - Invalid date parameters"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin role required")
    })
    public ResponseEntity<com.ecommerce.dto.response.ApiResponse<ProductAnalyticsResponse>> getProductAnalytics(
            @Parameter(description = "Start date for analytics (ISO format: yyyy-MM-dd'T'HH:mm:ss)")
            @RequestParam(required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            
            @Parameter(description = "End date for analytics (ISO format: yyyy-MM-dd'T'HH:mm:ss)")
            @RequestParam(required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        // Use default date range if not provided (last 30 days)
        if (startDate == null || endDate == null) {
            LocalDateTime[] defaultRange = statisticsService.getDefaultDateRange();
            startDate = defaultRange[0];
            endDate = defaultRange[1];
        }
        
        ProductAnalyticsResponse analytics = statisticsService.getProductAnalytics(startDate, endDate);
        return ResponseEntity.ok(new com.ecommerce.dto.response.ApiResponse<>(true, "Product analytics retrieved successfully", analytics));
    }
    
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get user analytics", 
               description = "Retrieve user activity analytics including registration trends, top customers, and activity statistics")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "User analytics retrieved successfully"),
        @ApiResponse(responseCode = "400", description = "Bad Request - Invalid date parameters"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin role required")
    })
    public ResponseEntity<com.ecommerce.dto.response.ApiResponse<UserAnalyticsResponse>> getUserAnalytics(
            @Parameter(description = "Start date for analytics (ISO format: yyyy-MM-dd'T'HH:mm:ss)")
            @RequestParam(required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            
            @Parameter(description = "End date for analytics (ISO format: yyyy-MM-dd'T'HH:mm:ss)")
            @RequestParam(required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        // Use default date range if not provided (last 30 days)
        if (startDate == null || endDate == null) {
            LocalDateTime[] defaultRange = statisticsService.getDefaultDateRange();
            startDate = defaultRange[0];
            endDate = defaultRange[1];
        }
        
        UserAnalyticsResponse analytics = statisticsService.getUserAnalytics(startDate, endDate);
        return ResponseEntity.ok(new com.ecommerce.dto.response.ApiResponse<>(true, "User analytics retrieved successfully", analytics));
    }
    
    @GetMapping("/overview")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get comprehensive analytics overview", 
               description = "Retrieve a comprehensive overview combining dashboard stats, sales, products, and user analytics")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Analytics overview retrieved successfully"),
        @ApiResponse(responseCode = "400", description = "Bad Request - Invalid date parameters"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid or missing JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Admin role required")
    })
    public ResponseEntity<com.ecommerce.dto.response.ApiResponse<AnalyticsOverviewResponse>> getAnalyticsOverview(
            @Parameter(description = "Start date for analytics (ISO format: yyyy-MM-dd'T'HH:mm:ss)")
            @RequestParam(required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            
            @Parameter(description = "End date for analytics (ISO format: yyyy-MM-dd'T'HH:mm:ss)")
            @RequestParam(required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        // Use default date range if not provided (last 30 days)
        if (startDate == null || endDate == null) {
            LocalDateTime[] defaultRange = statisticsService.getDefaultDateRange();
            startDate = defaultRange[0];
            endDate = defaultRange[1];
        }
        
        // Get all analytics data
        DashboardStatsResponse dashboardStats = statisticsService.getDashboardStats();
        SalesAnalyticsResponse salesAnalytics = statisticsService.getSalesAnalytics(startDate, endDate);
        ProductAnalyticsResponse productAnalytics = statisticsService.getProductAnalytics(startDate, endDate);
        UserAnalyticsResponse userAnalytics = statisticsService.getUserAnalytics(startDate, endDate);
        
        AnalyticsOverviewResponse overview = new AnalyticsOverviewResponse(
            dashboardStats, salesAnalytics, productAnalytics, userAnalytics, startDate, endDate
        );
        
        return ResponseEntity.ok(new com.ecommerce.dto.response.ApiResponse<>(true, "Analytics overview retrieved successfully", overview));
    }
}