package com.ecommerce.repository;

import com.ecommerce.entity.Order;
import com.ecommerce.entity.OrderItem;
import com.ecommerce.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for OrderItem entity operations.
 * Provides custom query methods for order item management and analytics.
 */
@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    
    /**
     * Find order items by order.
     * Used for order detail display.
     */
    List<OrderItem> findByOrder(Order order);
    
    /**
     * Find order items by order ID.
     * Used for order detail display.
     */
    List<OrderItem> findByOrderId(Long orderId);
    
    /**
     * Find order items by product.
     * Used for product sales analytics.
     */
    List<OrderItem> findByProduct(Product product);
    
    /**
     * Find order items by product ID.
     * Used for product sales analytics.
     */
    List<OrderItem> findByProductId(Long productId);
    
    /**
     * Get best-selling products by quantity.
     * Used for product analytics and recommendations.
     */
    @Query("SELECT oi.product, SUM(oi.quantity) as totalQuantity FROM OrderItem oi " +
           "JOIN oi.order o WHERE o.status = 'DELIVERED' " +
           "GROUP BY oi.product ORDER BY totalQuantity DESC")
    List<Object[]> findBestSellingProductsByQuantity();
    
    /**
     * Get best-selling products by revenue.
     * Used for product analytics and recommendations.
     */
    @Query("SELECT oi.product, SUM(oi.totalPrice) as totalRevenue FROM OrderItem oi " +
           "JOIN oi.order o WHERE o.status = 'DELIVERED' " +
           "GROUP BY oi.product ORDER BY totalRevenue DESC")
    List<Object[]> findBestSellingProductsByRevenue();
    
    /**
     * Calculate total quantity sold for a product.
     * Used for inventory and sales analytics.
     */
    @Query("SELECT COALESCE(SUM(oi.quantity), 0) FROM OrderItem oi " +
           "JOIN oi.order o WHERE oi.product.id = :productId AND o.status = 'DELIVERED'")
    Long calculateTotalQuantitySold(@Param("productId") Long productId);
    
    /**
     * Calculate total revenue for a product.
     * Used for product performance analytics.
     */
    @Query("SELECT COALESCE(SUM(oi.totalPrice), 0) FROM OrderItem oi " +
           "JOIN oi.order o WHERE oi.product.id = :productId AND o.status = 'DELIVERED'")
    java.math.BigDecimal calculateProductRevenue(@Param("productId") Long productId);
}