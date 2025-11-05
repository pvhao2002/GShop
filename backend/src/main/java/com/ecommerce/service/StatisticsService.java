package com.ecommerce.service;

import com.ecommerce.dto.response.*;
import com.ecommerce.entity.OrderStatus;
import com.ecommerce.entity.PaymentMethod;
import com.ecommerce.entity.Role;
import com.ecommerce.repository.OrderItemRepository;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StatisticsService {
    
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    
    private static final int LOW_STOCK_THRESHOLD = 10;
    
    @Autowired
    public StatisticsService(OrderRepository orderRepository,
                           OrderItemRepository orderItemRepository,
                           ProductRepository productRepository,
                           UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }
    
    public DashboardStatsResponse getDashboardStats() {
        // Get basic counts
        Long totalOrders = orderRepository.getTotalOrderCount();
        Long totalCustomers = userRepository.getTotalCustomerCount();
        Long totalProducts = productRepository.countActiveProducts();
        
        // Get revenue data
        BigDecimal totalRevenue = orderRepository.getTotalAmountByStatus(OrderStatus.COMPLETED);
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;
        
        BigDecimal averageOrderValue = orderRepository.getAverageOrderValue();
        if (averageOrderValue == null) averageOrderValue = BigDecimal.ZERO;
        
        // Get order status counts
        Long pendingOrders = orderRepository.countByStatus(OrderStatus.PENDING);
        Long completedOrders = orderRepository.countByStatus(OrderStatus.COMPLETED);
        
        // Get inventory stats
        Long lowStockProducts = (long) productRepository.findByActiveTrueAndStockQuantityLessThan(LOW_STOCK_THRESHOLD).size();
        Long outOfStockProducts = productRepository.countOutOfStockProducts();
        
        return new DashboardStatsResponse(
            totalOrders, totalCustomers, totalProducts, totalRevenue, averageOrderValue,
            pendingOrders, completedOrders, lowStockProducts, outOfStockProducts
        );
    }
    
    public SalesAnalyticsResponse getSalesAnalytics(LocalDateTime startDate, LocalDateTime endDate) {
        // Get daily sales data
        List<Object[]> dailyData = orderRepository.getDailyOrderStatistics(startDate, endDate);
        List<SalesAnalyticsResponse.DailySalesData> dailySales = dailyData.stream()
            .map(row -> new SalesAnalyticsResponse.DailySalesData(
                ((java.sql.Date) row[0]).toLocalDate(),
                ((Number) row[1]).longValue(),
                (BigDecimal) row[2]
            ))
            .collect(Collectors.toList());
        
        // Get monthly sales data
        List<Object[]> monthlyData = orderRepository.getMonthlyOrderStatistics(startDate, endDate);
        List<SalesAnalyticsResponse.MonthlySalesData> monthlySales = monthlyData.stream()
            .map(row -> new SalesAnalyticsResponse.MonthlySalesData(
                ((Number) row[0]).intValue(),
                ((Number) row[1]).intValue(),
                ((Number) row[2]).longValue(),
                (BigDecimal) row[3]
            ))
            .collect(Collectors.toList());
        
        // Get total revenue and order count for the period
        BigDecimal totalRevenue = orderRepository.getTotalAmountBetween(startDate, endDate);
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;
        
        Long totalOrders = orderRepository.countOrdersBetween(startDate, endDate);
        
        BigDecimal averageOrderValue = BigDecimal.ZERO;
        if (totalOrders > 0) {
            averageOrderValue = totalRevenue.divide(BigDecimal.valueOf(totalOrders), 2, RoundingMode.HALF_UP);
        }
        
        // Get payment method statistics
        SalesAnalyticsResponse.PaymentMethodStats paymentStats = getPaymentMethodStats(startDate, endDate);
        
        return new SalesAnalyticsResponse(
            dailySales, monthlySales, totalRevenue, totalOrders, averageOrderValue, paymentStats
        );
    }
    
    public ProductAnalyticsResponse getProductAnalytics(LocalDateTime startDate, LocalDateTime endDate) {
        // Get top selling products
        Pageable topProductsPageable = PageRequest.of(0, 10);
        List<Object[]> topProductsData = orderItemRepository.getTopSellingProductsDetailed(startDate, endDate, topProductsPageable);
        List<ProductAnalyticsResponse.TopSellingProduct> topSellingProducts = topProductsData.stream()
            .map(row -> new ProductAnalyticsResponse.TopSellingProduct(
                ((Number) row[0]).longValue(),
                (String) row[1],
                ((Number) row[2]).longValue(),
                (BigDecimal) row[3],
                (BigDecimal) row[4]
            ))
            .collect(Collectors.toList());
        
        // Get category performance
        List<Object[]> categoryData = orderItemRepository.getCategoryPerformanceStatistics(startDate, endDate);
        List<ProductAnalyticsResponse.CategoryPerformance> categoryPerformance = categoryData.stream()
            .map(row -> new ProductAnalyticsResponse.CategoryPerformance(
                ((Number) row[0]).longValue(),
                (String) row[1],
                ((Number) row[2]).longValue(),
                ((Number) row[3]).longValue(),
                (BigDecimal) row[4]
            ))
            .collect(Collectors.toList());
        
        // Get inventory stats
        Long inStockProducts = productRepository.countInStockProducts();
        Long outOfStockProducts = productRepository.countOutOfStockProducts();
        Long lowStockProducts = (long) productRepository.findByActiveTrueAndStockQuantityLessThan(LOW_STOCK_THRESHOLD).size();
        
        ProductAnalyticsResponse.InventoryStats inventoryStats = new ProductAnalyticsResponse.InventoryStats(
            inStockProducts, outOfStockProducts, lowStockProducts, LOW_STOCK_THRESHOLD
        );
        
        // Get total product counts
        Long totalProducts = productRepository.count();
        Long activeProducts = productRepository.countActiveProducts();
        
        return new ProductAnalyticsResponse(
            topSellingProducts, categoryPerformance, inventoryStats, totalProducts, activeProducts
        );
    }
    
    public UserAnalyticsResponse getUserAnalytics(LocalDateTime startDate, LocalDateTime endDate) {
        // Get user counts
        Long totalUsers = userRepository.getTotalCustomerCount();
        Long activeUsers = userRepository.getActiveCustomerCount();
        
        // Get new users this month
        LocalDateTime monthStart = YearMonth.now().atDay(1).atStartOfDay();
        LocalDateTime monthEnd = YearMonth.now().atEndOfMonth().atTime(23, 59, 59);
        Long newUsersThisMonth = userRepository.countUsersCreatedBetween(monthStart, monthEnd);
        
        // Get user registration trend
        List<Object[]> registrationData = userRepository.getUserRegistrationTrend(startDate, endDate);
        List<UserAnalyticsResponse.UserRegistrationData> userRegistrationTrend = registrationData.stream()
            .map(row -> new UserAnalyticsResponse.UserRegistrationData(
                ((java.sql.Date) row[0]).toLocalDate(),
                ((Number) row[1]).longValue()
            ))
            .collect(Collectors.toList());
        
        // Get top customers
        Pageable topCustomersPageable = PageRequest.of(0, 10);
        List<Object[]> topCustomersData = orderRepository.getTopCustomersBySpending(topCustomersPageable);
        List<UserAnalyticsResponse.TopCustomer> topCustomers = topCustomersData.stream()
            .map(row -> new UserAnalyticsResponse.TopCustomer(
                ((Number) row[0]).longValue(),
                (String) row[1] + " " + (String) row[2],
                (String) row[3],
                ((Number) row[4]).longValue(),
                (BigDecimal) row[5],
                (BigDecimal) row[6]
            ))
            .collect(Collectors.toList());
        
        // Get customer activity stats
        Long customersWithOrders = orderRepository.getUniqueCustomerCount();
        Long customersWithoutOrders = totalUsers - customersWithOrders;
        BigDecimal averageCustomerLifetimeValue = orderRepository.getAverageCustomerLifetimeValue();
        if (averageCustomerLifetimeValue == null) averageCustomerLifetimeValue = BigDecimal.ZERO;
        Long repeatCustomers = orderRepository.getRepeatCustomerCount();
        
        UserAnalyticsResponse.CustomerActivityStats activityStats = new UserAnalyticsResponse.CustomerActivityStats(
            customersWithOrders, customersWithoutOrders, averageCustomerLifetimeValue, repeatCustomers
        );
        
        return new UserAnalyticsResponse(
            totalUsers, activeUsers, newUsersThisMonth, userRegistrationTrend, topCustomers, activityStats
        );
    }
    
    private SalesAnalyticsResponse.PaymentMethodStats getPaymentMethodStats(LocalDateTime startDate, LocalDateTime endDate) {
        List<Object[]> paymentData = orderRepository.getPaymentMethodStatistics(startDate, endDate);
        
        Long codOrders = 0L;
        Long momoOrders = 0L;
        Long vnpayOrders = 0L;
        BigDecimal codRevenue = BigDecimal.ZERO;
        BigDecimal momoRevenue = BigDecimal.ZERO;
        BigDecimal vnpayRevenue = BigDecimal.ZERO;
        
        for (Object[] row : paymentData) {
            PaymentMethod method = (PaymentMethod) row[0];
            Long orderCount = ((Number) row[1]).longValue();
            BigDecimal revenue = (BigDecimal) row[2];
            
            switch (method) {
                case COD:
                    codOrders = orderCount;
                    codRevenue = revenue;
                    break;
                case MOMO:
                    momoOrders = orderCount;
                    momoRevenue = revenue;
                    break;
                case VNPAY:
                    vnpayOrders = orderCount;
                    vnpayRevenue = revenue;
                    break;
            }
        }
        
        return new SalesAnalyticsResponse.PaymentMethodStats(
            codOrders, momoOrders, vnpayOrders, codRevenue, momoRevenue, vnpayRevenue
        );
    }
    
    // Helper method to get default date range (last 30 days)
    public LocalDateTime[] getDefaultDateRange() {
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = endDate.minusDays(30);
        return new LocalDateTime[]{startDate, endDate};
    }
    
    // Helper method to get current month date range
    public LocalDateTime[] getCurrentMonthDateRange() {
        YearMonth currentMonth = YearMonth.now();
        LocalDateTime startDate = currentMonth.atDay(1).atStartOfDay();
        LocalDateTime endDate = currentMonth.atEndOfMonth().atTime(23, 59, 59);
        return new LocalDateTime[]{startDate, endDate};
    }
    
    // Helper method to get current year date range
    public LocalDateTime[] getCurrentYearDateRange() {
        LocalDateTime startDate = LocalDateTime.now().withDayOfYear(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime endDate = LocalDateTime.now().withMonth(12).withDayOfMonth(31).withHour(23).withMinute(59).withSecond(59);
        return new LocalDateTime[]{startDate, endDate};
    }
}