package com.ecommerce.repository;

import com.ecommerce.entity.Order;
import com.ecommerce.entity.Payment;
import com.ecommerce.entity.PaymentMethod;
import com.ecommerce.entity.PaymentStatus;
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
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    // Order-specific queries
    List<Payment> findByOrder(Order order);
    
    List<Payment> findByOrderId(Long orderId);
    
    Optional<Payment> findByOrderIdAndStatus(Long orderId, PaymentStatus status);
    
    @Query("SELECT COUNT(p) FROM Payment p WHERE p.order.id = :orderId")
    long countByOrderId(@Param("orderId") Long orderId);
    
    // Transaction ID queries
    Optional<Payment> findByTransactionId(String transactionId);
    
    Optional<Payment> findByGatewayTransactionId(String gatewayTransactionId);
    
    boolean existsByTransactionId(String transactionId);
    
    boolean existsByGatewayTransactionId(String gatewayTransactionId);
    
    // Status-based queries
    Page<Payment> findByStatus(PaymentStatus status, Pageable pageable);
    
    List<Payment> findByStatus(PaymentStatus status);
    
    @Query("SELECT COUNT(p) FROM Payment p WHERE p.status = :status")
    long countByStatus(@Param("status") PaymentStatus status);
    
    // Payment method queries
    Page<Payment> findByPaymentMethod(PaymentMethod paymentMethod, Pageable pageable);
    
    List<Payment> findByPaymentMethod(PaymentMethod paymentMethod);
    
    @Query("SELECT COUNT(p) FROM Payment p WHERE p.paymentMethod = :paymentMethod")
    long countByPaymentMethod(@Param("paymentMethod") PaymentMethod paymentMethod);
    
    // Combined status and method queries
    List<Payment> findByStatusAndPaymentMethod(PaymentStatus status, PaymentMethod paymentMethod);
    
    Page<Payment> findByStatusAndPaymentMethod(PaymentStatus status, PaymentMethod paymentMethod, Pageable pageable);
    
    // Date range queries
    List<Payment> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    Page<Payment> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    
    List<Payment> findByProcessedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("SELECT COUNT(p) FROM Payment p WHERE p.createdAt BETWEEN :startDate AND :endDate")
    long countPaymentsBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // Amount-based queries
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = :status")
    BigDecimal getTotalAmountByStatus(@Param("status") PaymentStatus status);
    
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.paymentMethod = :paymentMethod AND p.status = 'PAID'")
    BigDecimal getTotalAmountByPaymentMethod(@Param("paymentMethod") PaymentMethod paymentMethod);
    
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = 'PAID' AND p.createdAt BETWEEN :startDate AND :endDate")
    BigDecimal getTotalPaidAmountBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // User-specific queries
    @Query("SELECT p FROM Payment p WHERE p.order.user.id = :userId")
    Page<Payment> findByUserId(@Param("userId") Long userId, Pageable pageable);
    
    @Query("SELECT p FROM Payment p WHERE p.order.user.id = :userId AND p.status = :status")
    List<Payment> findByUserIdAndStatus(@Param("userId") Long userId, @Param("status") PaymentStatus status);
    
    @Query("SELECT COUNT(p) FROM Payment p WHERE p.order.user.id = :userId")
    long countByUserId(@Param("userId") Long userId);
    
    // Failed payment queries
    List<Payment> findByStatusAndFailureReasonIsNotNull(PaymentStatus status);
    
    @Query("SELECT p FROM Payment p WHERE p.status = 'FAILED' AND p.createdAt BETWEEN :startDate AND :endDate")
    List<Payment> findFailedPaymentsBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // Statistics queries
    @Query("SELECT p.paymentMethod, COUNT(p) as count, SUM(p.amount) as totalAmount " +
           "FROM Payment p WHERE p.status = 'PAID' AND p.createdAt BETWEEN :startDate AND :endDate " +
           "GROUP BY p.paymentMethod")
    List<Object[]> getPaymentMethodStatistics(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT p.status, COUNT(p) as count FROM Payment p GROUP BY p.status")
    List<Object[]> getPaymentStatusStatistics();
    
    @Query("SELECT DATE(p.createdAt) as paymentDate, COUNT(p) as paymentCount, SUM(p.amount) as totalAmount " +
           "FROM Payment p WHERE p.status = 'PAID' AND p.createdAt BETWEEN :startDate AND :endDate " +
           "GROUP BY DATE(p.createdAt) ORDER BY DATE(p.createdAt)")
    List<Object[]> getDailyPaymentStatistics(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // Recent payments
    @Query("SELECT p FROM Payment p ORDER BY p.createdAt DESC")
    Page<Payment> findRecentPayments(Pageable pageable);
    
    List<Payment> findTop10ByOrderByCreatedAtDesc();
    
    // Pending payments
    @Query("SELECT p FROM Payment p WHERE p.status = 'PENDING' AND p.createdAt < :cutoffTime")
    List<Payment> findPendingPaymentsOlderThan(@Param("cutoffTime") LocalDateTime cutoffTime);
    
    // Success rate queries
    @Query("SELECT " +
           "COUNT(CASE WHEN p.status = 'PAID' THEN 1 END) as successCount, " +
           "COUNT(CASE WHEN p.status = 'FAILED' THEN 1 END) as failureCount, " +
           "COUNT(p) as totalCount " +
           "FROM Payment p WHERE p.createdAt BETWEEN :startDate AND :endDate")
    Object[] getPaymentSuccessRate(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}