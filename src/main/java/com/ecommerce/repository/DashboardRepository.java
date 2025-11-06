package com.ecommerce.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository interface for dashboard analytics and metrics.
 * Provides complex queries that aggregate data from multiple entities for dashboard display.
 */
@Repository
public interface DashboardRepository extends JpaRepository<Object, Long> {
    
    /**
     * Get comprehensive dashboard overview metrics.
     * Returns key performance indicators across all entities.
     */
    @Query(value = "SELECT " +
           "(SELECT COUNT(*) FROM users WHERE role = 'USER' AND is_active = true) as totalCustomers, " +
           "(SELECT COUNT(*) FROM products WHERE is_active = true) as totalProducts, " +
           "(SELECT COUNT(*) FROM orders) as totalOrders, " +
           "(SELECT COUNT(*) FROM orders WHERE status = 'DELIVERED') as completedOrders, " +
           "(SELECT COALESCE(SUM(total), 0) FROM orders WHERE status = 'DELIVERED') as totalRevenue, " +
           "(SELECT COALESCE(AVG(total), 0) FROM orders WHERE status = 'DELIVERED') as averageOrderValue, " +
           "(SELECT COUNT(*) FROM categories) as totalCategories, " +
           "(SELECT COUNT(*) FROM orders WHERE status = 'PENDING') as pendingOrders",
           nativeQuery = true)
    Object[] getDashboardOverview();
    
    /**
     * Get sales performance metrics for a specific time period.
     * Used for sales analytics and performance tracking.
     */
    @Query(value = "SELECT " +
           "COUNT(o.id) as orderCount, " +
           "COALESCE(SUM(o.total), 0) as totalRevenue, " +
           "COALESCE(AVG(o.total), 0) as averageOrderValue, " +
           "COUNT(DISTINCT o.user_id) as uniqueCustomers, " +
           "COALESCE(SUM(oi.quantity), 0) as totalItemsSold " +
           "FROM orders o " +
           "LEFT JOIN order_items oi ON o.id = oi.order_id " +
           "WHERE o.status = 'DELIVERED' AND o.created_at BETWEEN :startDate AND :endDate",
           nativeQuery = true)
    Object[] getSalesMetrics(@Param("startDate") LocalDateTime startDate,
                            @Param("endDate") LocalDateTime endDate);
    
    /**
     * Get top performing products by revenue.
     * Used for product performance analysis.
     */
    @Query(value = "SELECT " +
           "p.id, p.name, " +
           "COALESCE(SUM(oi.total_price), 0) as totalRevenue, " +
           "COALESCE(SUM(oi.quantity), 0) as totalQuantitySold, " +
           "COUNT(DISTINCT o.id) as orderCount " +
           "FROM products p " +
           "LEFT JOIN order_items oi ON p.id = oi.product_id " +
           "LEFT JOIN orders o ON oi.order_id = o.id AND o.status = 'DELIVERED' " +
           "WHERE p.is_active = true " +
           "GROUP BY p.id, p.name " +
           "ORDER BY totalRevenue DESC " +
           "LIMIT :limit",
           nativeQuery = true)
    List<Object[]> getTopProductsByRevenue(@Param("limit") int limit);
    
    /**
     * Get customer analytics metrics.
     * Used for customer behavior analysis.
     */
    @Query(value = "SELECT " +
           "COUNT(DISTINCT u.id) as totalCustomers, " +
           "COUNT(DISTINCT CASE WHEN o.id IS NOT NULL THEN u.id END) as customersWithOrders, " +
           "COALESCE(AVG(customer_orders.order_count), 0) as averageOrdersPerCustomer, " +
           "COALESCE(AVG(customer_orders.total_spent), 0) as averageSpentPerCustomer " +
           "FROM users u " +
           "LEFT JOIN (" +
           "    SELECT user_id, COUNT(*) as order_count, SUM(total) as total_spent " +
           "    FROM orders WHERE status = 'DELIVERED' GROUP BY user_id" +
           ") customer_orders ON u.id = customer_orders.user_id " +
           "WHERE u.role = 'USER' AND u.is_active = true",
           nativeQuery = true)
    Object[] getCustomerAnalytics();
    
    /**
     * Get inventory status summary.
     * Used for inventory management dashboard.
     */
    @Query(value = "SELECT " +
           "COUNT(DISTINCT p.id) as totalProducts, " +
           "COUNT(DISTINCT CASE WHEN pv.quantity > 0 THEN p.id END) as productsInStock, " +
           "COUNT(DISTINCT CASE WHEN pv.quantity = 0 THEN p.id END) as outOfStockProducts, " +
           "COUNT(DISTINCT CASE WHEN pv.quantity <= :lowStockThreshold AND pv.quantity > 0 THEN p.id END) as lowStockProducts, " +
           "COALESCE(SUM(pv.quantity), 0) as totalInventoryUnits " +
           "FROM products p " +
           "LEFT JOIN product_variants pv ON p.id = pv.product_id " +
           "WHERE p.is_active = true",
           nativeQuery = true)
    Object[] getInventoryStatus(@Param("lowStockThreshold") int lowStockThreshold);
    
    /**
     * Get recent activity summary for dashboard.
     * Shows recent orders, new customers, and product updates.
     */
    @Query(value = "SELECT " +
           "(SELECT COUNT(*) FROM orders WHERE created_at >= :since) as recentOrders, " +
           "(SELECT COUNT(*) FROM users WHERE created_at >= :since AND role = 'USER') as newCustomers, " +
           "(SELECT COUNT(*) FROM products WHERE created_at >= :since) as newProducts, " +
           "(SELECT COUNT(*) FROM orders WHERE status = 'PENDING' AND created_at >= :since) as pendingOrders",
           nativeQuery = true)
    Object[] getRecentActivity(@Param("since") LocalDateTime since);
    
    /**
     * Get monthly growth trends.
     * Used for growth analysis and forecasting.
     */
    @Query(value = "SELECT " +
           "DATE_FORMAT(month_data.month_year, '%Y-%m') as month, " +
           "COALESCE(order_data.order_count, 0) as orders, " +
           "COALESCE(order_data.revenue, 0) as revenue, " +
           "COALESCE(user_data.new_customers, 0) as newCustomers " +
           "FROM (" +
           "    SELECT DATE_FORMAT(created_at, '%Y-%m-01') as month_year FROM orders " +
           "    WHERE created_at BETWEEN :startDate AND :endDate " +
           "    UNION " +
           "    SELECT DATE_FORMAT(created_at, '%Y-%m-01') as month_year FROM users " +
           "    WHERE created_at BETWEEN :startDate AND :endDate" +
           ") month_data " +
           "LEFT JOIN (" +
           "    SELECT DATE_FORMAT(created_at, '%Y-%m-01') as month_year, " +
           "           COUNT(*) as order_count, SUM(total) as revenue " +
           "    FROM orders WHERE status = 'DELIVERED' AND created_at BETWEEN :startDate AND :endDate " +
           "    GROUP BY DATE_FORMAT(created_at, '%Y-%m-01')" +
           ") order_data ON month_data.month_year = order_data.month_year " +
           "LEFT JOIN (" +
           "    SELECT DATE_FORMAT(created_at, '%Y-%m-01') as month_year, COUNT(*) as new_customers " +
           "    FROM users WHERE role = 'USER' AND created_at BETWEEN :startDate AND :endDate " +
           "    GROUP BY DATE_FORMAT(created_at, '%Y-%m-01')" +
           ") user_data ON month_data.month_year = user_data.month_year " +
           "ORDER BY month_data.month_year",
           nativeQuery = true)
    List<Object[]> getMonthlyGrowthTrends(@Param("startDate") LocalDateTime startDate,
                                         @Param("endDate") LocalDateTime endDate);
}