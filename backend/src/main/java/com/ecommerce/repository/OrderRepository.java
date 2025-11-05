package com.ecommerce.repository;

import com.ecommerce.entity.Order;
import com.ecommerce.entity.OrderStatus;
import com.ecommerce.entity.PaymentMethod;
import com.ecommerce.entity.PaymentStatus;
import com.ecommerce.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    // User-specific queries
    Page<Order> findByUser(User user, Pageable pageable);
    
    Page<Order> findByUserId(Long userId, Pageable pageable);
    
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    @Query("SELECT COUNT(o) FROM Order o WHERE o.user.id = :userId")
    long countByUserId(@Param("userId") Long userId);
    
    // Status-based queries
    Page<Order> findByStatus(OrderStatus status, Pageable pageable);
    
    List<Order> findByStatus(OrderStatus status);
    
    Page<Order> findByUserIdAndStatus(Long userId, OrderStatus status, Pageable pageable);
    
    List<Order> findByUserIdAndStatus(Long userId, OrderStatus status);
    
    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status")
    long countByStatus(@Param("status") OrderStatus status);
    
    // Payment-related queries
    Page<Order> findByPaymentMethod(PaymentMethod paymentMethod, Pageable pageable);
    
    Page<Order> findByPaymentStatus(PaymentStatus paymentStatus, Pageable pageable);
    
    List<Order> findByPaymentStatusAndStatus(PaymentStatus paymentStatus, OrderStatus orderStatus);
    
    @Query("SELECT COUNT(o) FROM Order o WHERE o.paymentMethod = :paymentMethod")
    long countByPaymentMethod(@Param("paymentMethod") PaymentMethod paymentMethod);
    
    @Query("SELECT COUNT(o) FROM Order o WHERE o.paymentStatus = :paymentStatus")
    long countByPaymentStatus(@Param("paymentStatus") PaymentStatus paymentStatus);
    
    // Date range queries
    List<Order> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    Page<Order> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    
    @Query("SELECT COUNT(o) FROM Order o WHERE o.createdAt BETWEEN :startDate AND :endDate")
    long countOrdersBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // Amount-based queries
    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status = :status")
    BigDecimal getTotalAmountByStatus(@Param("status") OrderStatus status);
    
    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.createdAt BETWEEN :startDate AND :endDate")
    BigDecimal getTotalAmountBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status = :status AND o.createdAt BETWEEN :startDate AND :endDate")
    BigDecimal getTotalAmountByStatusAndDateRange(@Param("status") OrderStatus status, 
                                                @Param("startDate") LocalDateTime startDate, 
                                                @Param("endDate") LocalDateTime endDate);
    
    // Advanced filtering
    @Query("SELECT o FROM Order o WHERE " +
           "(:userId IS NULL OR o.user.id = :userId) AND " +
           "(:status IS NULL OR o.status = :status) AND " +
           "(:paymentMethod IS NULL OR o.paymentMethod = :paymentMethod) AND " +
           "(:paymentStatus IS NULL OR o.paymentStatus = :paymentStatus) AND " +
           "(:startDate IS NULL OR o.createdAt >= :startDate) AND " +
           "(:endDate IS NULL OR o.createdAt <= :endDate)")
    Page<Order> findWithFilters(@Param("userId") Long userId,
                              @Param("status") OrderStatus status,
                              @Param("paymentMethod") PaymentMethod paymentMethod,
                              @Param("paymentStatus") PaymentStatus paymentStatus,
                              @Param("startDate") LocalDateTime startDate,
                              @Param("endDate") LocalDateTime endDate,
                              Pageable pageable);
    
    // Recent orders
    @Query("SELECT o FROM Order o ORDER BY o.createdAt DESC")
    Page<Order> findRecentOrders(Pageable pageable);
    
    List<Order> findTop10ByOrderByCreatedAtDesc();
    
    // Tracking queries
    Optional<Order> findByTrackingNumber(String trackingNumber);
    
    boolean existsByTrackingNumber(String trackingNumber);
    
    // Statistics queries
    @Query("SELECT COUNT(o) FROM Order o")
    long getTotalOrderCount();
    
    @Query("SELECT AVG(o.totalAmount) FROM Order o WHERE o.status = 'COMPLETED'")
    BigDecimal getAverageOrderValue();
    
    @Query("SELECT COUNT(DISTINCT o.user.id) FROM Order o")
    long getUniqueCustomerCount();
    
    // Daily/Monthly statistics
    @Query("SELECT DATE(o.createdAt) as orderDate, COUNT(o) as orderCount, SUM(o.totalAmount) as totalAmount " +
           "FROM Order o WHERE o.createdAt BETWEEN :startDate AND :endDate " +
           "GROUP BY DATE(o.createdAt) ORDER BY DATE(o.createdAt)")
    List<Object[]> getDailyOrderStatistics(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT YEAR(o.createdAt) as year, MONTH(o.createdAt) as month, COUNT(o) as orderCount, SUM(o.totalAmount) as totalAmount " +
           "FROM Order o WHERE o.createdAt BETWEEN :startDate AND :endDate " +
           "GROUP BY YEAR(o.createdAt), MONTH(o.createdAt) ORDER BY YEAR(o.createdAt), MONTH(o.createdAt)")
    List<Object[]> getMonthlyOrderStatistics(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // Payment method statistics
    @Query("SELECT o.paymentMethod, COUNT(o), SUM(o.totalAmount) " +
           "FROM Order o WHERE o.createdAt BETWEEN :startDate AND :endDate " +
           "GROUP BY o.paymentMethod")
    List<Object[]> getPaymentMethodStatistics(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // Top customers by order count and total spent
    @Query("SELECT o.user.id, o.user.firstName, o.user.lastName, o.user.email, COUNT(o), SUM(o.totalAmount), AVG(o.totalAmount) " +
           "FROM Order o WHERE o.status = 'COMPLETED' " +
           "GROUP BY o.user.id, o.user.firstName, o.user.lastName, o.user.email " +
           "ORDER BY SUM(o.totalAmount) DESC")
    List<Object[]> getTopCustomersBySpending(Pageable pageable);
    
    // Customer activity statistics
    @Query("SELECT COUNT(DISTINCT o.user.id) FROM Order o WHERE o.user.id IN " +
           "(SELECT o2.user.id FROM Order o2 GROUP BY o2.user.id HAVING COUNT(o2) > 1)")
    long getRepeatCustomerCount();
    
    @Query("SELECT AVG(customerTotal.totalSpent) FROM " +
           "(SELECT SUM(o.totalAmount) as totalSpent FROM Order o WHERE o.status = 'COMPLETED' GROUP BY o.user.id) as customerTotal")
    BigDecimal getAverageCustomerLifetimeValue();
}