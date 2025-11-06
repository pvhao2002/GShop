package com.ecommerce.repository;

import com.ecommerce.entity.Order;
import com.ecommerce.entity.OrderStatus;
import com.ecommerce.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository interface for Order entity operations.
 * Provides custom query methods for order management, user-specific queries, and admin operations.
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {

    /**
     * Find orders by user.
     * Used for user order history.
     */
    Page<Order> findByUser(User user, Pageable pageable);

    /**
     * Find orders by user ID.
     * Used for user order history.
     */
    Page<Order> findByUserId(Long userId, Pageable pageable);

    /**
     * Find orders by user and status.
     * Used for filtering user orders by status.
     */
    Page<Order> findByUserAndStatus(User user, OrderStatus status, Pageable pageable);

    /**
     * Find orders by user ID and status.
     * Used for filtering user orders by status.
     */
    Page<Order> findByUserIdAndStatus(Long userId, OrderStatus status, Pageable pageable);

    /**
     * Find orders by status.
     * Used for admin order management and filtering.
     */
    Page<Order> findByStatus(OrderStatus status, Pageable pageable);

    /**
     * Find orders created within a date range.
     * Used for admin order filtering and reporting.
     */
    @Query("SELECT o FROM Order o WHERE o.createdAt BETWEEN :startDate AND :endDate")
    Page<Order> findByCreatedAtBetween(@Param("startDate") LocalDateTime startDate,
                                       @Param("endDate") LocalDateTime endDate,
                                       Pageable pageable);

    /**
     * Find orders by status and date range.
     * Used for admin order filtering with combined criteria.
     */
    @Query("SELECT o FROM Order o WHERE o.status = :status AND o.createdAt BETWEEN :startDate AND :endDate")
    Page<Order> findByStatusAndCreatedAtBetween(@Param("status") OrderStatus status,
                                                @Param("startDate") LocalDateTime startDate,
                                                @Param("endDate") LocalDateTime endDate,
                                                Pageable pageable);

    /**
     * Find orders by user and date range.
     * Used for user order history with date filtering.
     */
    @Query("SELECT o FROM Order o WHERE o.user.id = :userId AND o.createdAt BETWEEN :startDate AND :endDate")
    Page<Order> findByUserIdAndCreatedAtBetween(@Param("userId") Long userId,
                                                @Param("startDate") LocalDateTime startDate,
                                                @Param("endDate") LocalDateTime endDate,
                                                Pageable pageable);

    /**
     * Find orders with total amount within a range.
     * Used for admin order filtering by amount.
     */
    @Query("SELECT o FROM Order o WHERE o.total BETWEEN :minAmount AND :maxAmount")
    Page<Order> findByTotalBetween(@Param("minAmount") BigDecimal minAmount,
                                   @Param("maxAmount") BigDecimal maxAmount,
                                   Pageable pageable);

    /**
     * Search orders by user email or name.
     * Used for admin order search functionality.
     */
    @Query("SELECT o FROM Order o WHERE " +
            "LOWER(o.user.email) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(o.user.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(o.user.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<Order> searchOrdersByUser(@Param("searchTerm") String searchTerm, Pageable pageable);

    /**
     * Count orders by status.
     * Used for dashboard metrics and admin analytics.
     */
    long countByStatus(OrderStatus status);

    /**
     * Count orders by user.
     * Used for user analytics.
     */
    long countByUser(User user);

    /**
     * Count orders by user ID.
     * Used for user analytics.
     */
    long countByUserId(Long userId);

    /**
     * Calculate total revenue for all completed orders.
     * Used for dashboard metrics.
     */
    @Query("SELECT COALESCE(SUM(o.total), 0) FROM Order o WHERE o.status = 'DELIVERED'")
    BigDecimal calculateTotalRevenue();

    /**
     * Calculate total revenue within a date range.
     * Used for dashboard metrics and reporting.
     */
    @Query("SELECT COALESCE(SUM(o.total), 0) FROM Order o WHERE o.status = 'DELIVERED' " +
            "AND o.createdAt BETWEEN :startDate AND :endDate")
    BigDecimal calculateRevenueByDateRange(@Param("startDate") LocalDateTime startDate,
                                           @Param("endDate") LocalDateTime endDate);

    /**
     * Get daily order statistics for a date range.
     * Used for dashboard analytics and charts.
     */
    @Query("SELECT DATE(o.createdAt) as orderDate, COUNT(o) as orderCount, COALESCE(SUM(o.total), 0) as totalRevenue " +
            "FROM Order o WHERE o.createdAt BETWEEN :startDate AND :endDate " +
            "GROUP BY DATE(o.createdAt) ORDER BY orderDate")
    List<Object[]> getDailyOrderStatistics(@Param("startDate") LocalDateTime startDate,
                                           @Param("endDate") LocalDateTime endDate);

    /**
     * Get monthly order statistics for a date range.
     * Used for dashboard analytics and reports.
     */
    @Query("SELECT YEAR(o.createdAt) as year, MONTH(o.createdAt) as month, " +
            "COUNT(o) as orderCount, COALESCE(SUM(o.total), 0) as totalRevenue " +
            "FROM Order o WHERE o.createdAt BETWEEN :startDate AND :endDate " +
            "GROUP BY YEAR(o.createdAt), MONTH(o.createdAt) ORDER BY year, month")
    List<Object[]> getMonthlyOrderStatistics(@Param("startDate") LocalDateTime startDate,
                                             @Param("endDate") LocalDateTime endDate);

    /**
     * Find top customers by order count.
     * Used for customer analytics and marketing.
     */
    @Query("SELECT o.user, COUNT(o) as orderCount FROM Order o " +
            "GROUP BY o.user ORDER BY orderCount DESC")
    List<Object[]> findTopCustomersByOrderCount(Pageable pageable);

    /**
     * Find top customers by total spending.
     * Used for customer analytics and marketing.
     */
    @Query("SELECT o.user, COALESCE(SUM(o.total), 0) as totalSpent FROM Order o " +
            "WHERE o.status = 'DELIVERED' GROUP BY o.user ORDER BY totalSpent DESC")
    List<Object[]> findTopCustomersBySpending(Pageable pageable);

    /**
     * Advanced order search with multiple filters.
     * Used for comprehensive admin order filtering.
     */
    @Query("SELECT o FROM Order o WHERE " +
            "(:status IS NULL OR o.status = :status) AND " +
            "(:userId IS NULL OR o.user.id = :userId) AND " +
            "(:startDate IS NULL OR o.createdAt >= :startDate) AND " +
            "(:endDate IS NULL OR o.createdAt <= :endDate) AND " +
            "(:minAmount IS NULL OR o.total >= :minAmount) AND " +
            "(:maxAmount IS NULL OR o.total <= :maxAmount)")
    Page<Order> findWithFilters(@Param("status") OrderStatus status,
                                @Param("userId") Long userId,
                                @Param("startDate") LocalDateTime startDate,
                                @Param("endDate") LocalDateTime endDate,
                                @Param("minAmount") BigDecimal minAmount,
                                @Param("maxAmount") BigDecimal maxAmount,
                                Pageable pageable);

    /**
     * Get comprehensive dashboard metrics.
     * Returns order counts by status, total revenue, and average order value.
     */
    @Query("SELECT " +
            "COUNT(o) as totalOrders, " +
            "SUM(CASE WHEN o.status = 'PENDING' THEN 1 ELSE 0 END) as pendingOrders, " +
            "SUM(CASE WHEN o.status = 'PROCESSING' THEN 1 ELSE 0 END) as processingOrders, " +
            "SUM(CASE WHEN o.status = 'SHIPPED' THEN 1 ELSE 0 END) as shippedOrders, " +
            "SUM(CASE WHEN o.status = 'DELIVERED' THEN 1 ELSE 0 END) as deliveredOrders, " +
            "SUM(CASE WHEN o.status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelledOrders, " +
            "COALESCE(SUM(CASE WHEN o.status = 'DELIVERED' THEN o.total ELSE 0 END), 0) as totalRevenue, " +
            "COALESCE(AVG(CASE WHEN o.status = 'DELIVERED' THEN o.total END), 0) as averageOrderValue " +
            "FROM Order o")
    Object[] getDashboardMetrics();

    /**
     * Get order status distribution.
     * Used for dashboard charts and analytics.
     */
    @Query("SELECT o.status, COUNT(o) as count FROM Order o GROUP BY o.status")
    List<Object[]> getOrderStatusDistribution();

    /**
     * Find recent orders for dashboard.
     * Used for displaying recent activity.
     */
    @Query("SELECT o FROM Order o ORDER BY o.createdAt DESC")
    List<Order> findRecentOrders(Pageable pageable);

    /**
     * Calculate conversion metrics.
     * Returns orders vs total users for conversion rate calculation.
     */
    @Query("SELECT " +
            "COUNT(DISTINCT o.user) as customersWithOrders, " +
            "(SELECT COUNT(u) FROM User u WHERE u.role = 'USER') as totalCustomers " +
            "FROM Order o")
    Object[] getConversionMetrics();

    /**
     * Get total amount spent by user.
     * Used for user analytics in admin panel.
     */
    @Query("SELECT COALESCE(SUM(o.total), 0) FROM Order o WHERE o.user = :user AND o.status = 'DELIVERED'")
    BigDecimal getTotalSpentByUser(@Param("user") User user);

    /**
     * Get last order date by user.
     * Used for user analytics in admin panel.
     */
    @Query("SELECT MAX(o.createdAt) FROM Order o WHERE o.user = :user")
    LocalDateTime getLastOrderDateByUser(@Param("user") User user);

    /**
     * Find order with all related data optimized (prevents N+1).
     * Used for order detail page.
     */
    @Query("SELECT DISTINCT o FROM Order o " +
            "LEFT JOIN FETCH o.user " +
            "LEFT JOIN FETCH o.items oi " +
            "LEFT JOIN FETCH oi.product p " +
            "LEFT JOIN FETCH oi.variant " +
            "LEFT JOIN FETCH p.images " +
            "WHERE o.id = :id")
    Order findByIdWithAllData(@Param("id") Long id);

    /**
     * Find orders by user with optimized fetch joins.
     * Used for user order history with optimized loading.
     */
    @Query("SELECT DISTINCT o FROM Order o " +
            "LEFT JOIN FETCH o.items oi " +
            "LEFT JOIN FETCH oi.product " +
            "WHERE o.user.id = :userId " +
            "ORDER BY o.createdAt DESC")
    Page<Order> findByUserIdWithItems(@Param("userId") Long userId, Pageable pageable);

    /**
     * Find all orders with user data for admin (optimized).
     * Used for admin order listing with user information.
     */
    @Query("SELECT DISTINCT o FROM Order o " +
            "LEFT JOIN FETCH o.user " +
            "ORDER BY o.createdAt DESC")
    Page<Order> findAllWithUser(Pageable pageable);

    /**
     * Find orders by status with user data (optimized).
     * Used for admin order filtering by status.
     */
    @Query("SELECT DISTINCT o FROM Order o " +
            "LEFT JOIN FETCH o.user " +
            "WHERE o.status = :status " +
            "ORDER BY o.createdAt DESC")
    Page<Order> findByStatusWithUser(@Param("status") OrderStatus status, Pageable pageable);
}