package com.ecommerce.repository;

import com.ecommerce.entity.Order;
import com.ecommerce.entity.OrderItem;
import com.ecommerce.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    
    // Order-specific queries
    List<OrderItem> findByOrder(Order order);
    
    List<OrderItem> findByOrderId(Long orderId);
    
    @Query("SELECT COUNT(oi) FROM OrderItem oi WHERE oi.order.id = :orderId")
    long countByOrderId(@Param("orderId") Long orderId);
    
    @Query("SELECT SUM(oi.totalPrice) FROM OrderItem oi WHERE oi.order.id = :orderId")
    BigDecimal getTotalAmountByOrderId(@Param("orderId") Long orderId);
    
    // Product-specific queries
    List<OrderItem> findByProduct(Product product);
    
    List<OrderItem> findByProductId(Long productId);
    
    Page<OrderItem> findByProductId(Long productId, Pageable pageable);
    
    @Query("SELECT COUNT(oi) FROM OrderItem oi WHERE oi.product.id = :productId")
    long countByProductId(@Param("productId") Long productId);
    
    @Query("SELECT SUM(oi.quantity) FROM OrderItem oi WHERE oi.product.id = :productId")
    Long getTotalQuantitySoldByProductId(@Param("productId") Long productId);
    
    // Product sales statistics
    @Query("SELECT oi.product.id, oi.product.name, SUM(oi.quantity) as totalSold, SUM(oi.totalPrice) as totalRevenue " +
           "FROM OrderItem oi WHERE oi.order.createdAt BETWEEN :startDate AND :endDate " +
           "GROUP BY oi.product.id, oi.product.name " +
           "ORDER BY SUM(oi.quantity) DESC")
    List<Object[]> getProductSalesStatistics(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT oi.product.id, oi.product.name, SUM(oi.quantity) as totalSold " +
           "FROM OrderItem oi WHERE oi.order.createdAt BETWEEN :startDate AND :endDate " +
           "GROUP BY oi.product.id, oi.product.name " +
           "ORDER BY SUM(oi.quantity) DESC")
    Page<Object[]> getBestSellingProducts(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, Pageable pageable);
    
    // Variant-specific queries
    List<OrderItem> findBySelectedSize(String size);
    
    List<OrderItem> findBySelectedColor(String color);
    
    List<OrderItem> findBySelectedSizeAndSelectedColor(String size, String color);
    
    @Query("SELECT oi.selectedSize, COUNT(oi) as count FROM OrderItem oi WHERE oi.selectedSize IS NOT NULL GROUP BY oi.selectedSize ORDER BY COUNT(oi) DESC")
    List<Object[]> getSizePopularityStatistics();
    
    @Query("SELECT oi.selectedColor, COUNT(oi) as count FROM OrderItem oi WHERE oi.selectedColor IS NOT NULL GROUP BY oi.selectedColor ORDER BY COUNT(oi) DESC")
    List<Object[]> getColorPopularityStatistics();
    
    // Revenue queries
    @Query("SELECT SUM(oi.totalPrice) FROM OrderItem oi WHERE oi.order.createdAt BETWEEN :startDate AND :endDate")
    BigDecimal getTotalRevenueBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT oi.product.category.id, oi.product.category.name, SUM(oi.totalPrice) as categoryRevenue " +
           "FROM OrderItem oi WHERE oi.order.createdAt BETWEEN :startDate AND :endDate " +
           "GROUP BY oi.product.category.id, oi.product.category.name " +
           "ORDER BY SUM(oi.totalPrice) DESC")
    List<Object[]> getCategoryRevenueStatistics(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // User purchase history
    @Query("SELECT oi FROM OrderItem oi WHERE oi.order.user.id = :userId ORDER BY oi.order.createdAt DESC")
    Page<OrderItem> findByUserId(@Param("userId") Long userId, Pageable pageable);
    
    @Query("SELECT DISTINCT oi.product FROM OrderItem oi WHERE oi.order.user.id = :userId")
    List<Product> findProductsPurchasedByUser(@Param("userId") Long userId);
    
    // Quantity-based queries
    @Query("SELECT SUM(oi.quantity) FROM OrderItem oi WHERE oi.order.createdAt BETWEEN :startDate AND :endDate")
    Long getTotalItemsSoldBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT AVG(oi.quantity) FROM OrderItem oi")
    Double getAverageQuantityPerItem();
    
    // Price analysis
    @Query("SELECT AVG(oi.unitPrice) FROM OrderItem oi WHERE oi.product.id = :productId")
    BigDecimal getAverageSellingPriceByProduct(@Param("productId") Long productId);
    
    @Query("SELECT oi FROM OrderItem oi WHERE oi.unitPrice BETWEEN :minPrice AND :maxPrice")
    Page<OrderItem> findByPriceRange(@Param("minPrice") BigDecimal minPrice, @Param("maxPrice") BigDecimal maxPrice, Pageable pageable);
    
    // Category performance with product count and sales
    @Query("SELECT c.id, c.name, COUNT(DISTINCT oi.product.id) as productCount, SUM(oi.quantity) as totalSold, SUM(oi.totalPrice) as totalRevenue " +
           "FROM OrderItem oi JOIN oi.product.category c WHERE oi.order.createdAt BETWEEN :startDate AND :endDate " +
           "GROUP BY c.id, c.name " +
           "ORDER BY SUM(oi.totalPrice) DESC")
    List<Object[]> getCategoryPerformanceStatistics(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // Top selling products with detailed analytics
    @Query("SELECT oi.product.id, oi.product.name, SUM(oi.quantity) as totalSold, SUM(oi.totalPrice) as totalRevenue, AVG(oi.unitPrice) as avgPrice " +
           "FROM OrderItem oi WHERE oi.order.createdAt BETWEEN :startDate AND :endDate " +
           "GROUP BY oi.product.id, oi.product.name " +
           "ORDER BY SUM(oi.quantity) DESC")
    List<Object[]> getTopSellingProductsDetailed(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, Pageable pageable);
}