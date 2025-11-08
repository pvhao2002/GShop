package com.ecommerce.service.impl;

import com.ecommerce.repository.DashboardRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public class DashboardRepositoryImpl implements DashboardRepository {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public Object[] getDashboardOverview() {
        return (Object[]) entityManager.createNativeQuery("""
            SELECT 
                (SELECT COUNT(*) FROM users WHERE role = 'USER' AND is_active = true),
                (SELECT COUNT(*) FROM products WHERE is_active = true),
                (SELECT COUNT(*) FROM orders),
                (SELECT COUNT(*) FROM orders WHERE status = 'DELIVERED'),
                (SELECT COALESCE(SUM(total), 0) FROM orders WHERE status = 'DELIVERED'),
                (SELECT COALESCE(AVG(total), 0) FROM orders WHERE status = 'DELIVERED'),
                (SELECT COUNT(*) FROM categories),
                (SELECT COUNT(*) FROM orders WHERE status = 'PENDING')
        """).getSingleResult();
    }

    @Override
    public Object[] getSalesMetrics(LocalDateTime startDate, LocalDateTime endDate) {
        return (Object[]) entityManager.createNativeQuery("""
            SELECT 
                COUNT(o.id),
                COALESCE(SUM(o.total), 0),
                COALESCE(AVG(o.total), 0),
                COUNT(DISTINCT o.user_id),
                COALESCE(SUM(oi.quantity), 0)
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE o.status = 'DELIVERED'
              AND o.created_at BETWEEN :startDate AND :endDate
        """)
                .setParameter("startDate", startDate)
                .setParameter("endDate", endDate)
                .getSingleResult();
    }

    @Override
    public List<Object[]> getTopProductsByRevenue(int limit) {
        return entityManager.createNativeQuery("""
            SELECT 
                p.id, p.name,
                COALESCE(SUM(oi.total_price), 0),
                COALESCE(SUM(oi.quantity), 0),
                COUNT(DISTINCT o.id)
            FROM products p
            LEFT JOIN order_items oi ON p.id = oi.product_id
            LEFT JOIN orders o ON oi.order_id = o.id AND o.status = 'DELIVERED'
            WHERE p.is_active = true
            GROUP BY p.id, p.name
            ORDER BY SUM(oi.total_price) DESC
            LIMIT :limit
        """)
                .setParameter("limit", limit)
                .getResultList();
    }

    @Override
    public Object[] getCustomerAnalytics() {
        return (Object[]) entityManager.createNativeQuery("""
            SELECT 
                COUNT(DISTINCT u.id),
                COUNT(DISTINCT CASE WHEN o.id IS NOT NULL THEN u.id END),
                COALESCE(AVG(customer_orders.order_count), 0),
                COALESCE(AVG(customer_orders.total_spent), 0)
            FROM users u
            LEFT JOIN (
                SELECT user_id, COUNT(*) AS order_count, SUM(total) AS total_spent
                FROM orders WHERE status = 'DELIVERED' GROUP BY user_id
            ) customer_orders ON u.id = customer_orders.user_id
            LEFT JOIN orders o ON o.user_id = u.id
            WHERE u.role = 'USER' AND u.is_active = true
        """).getSingleResult();
    }

    @Override
    public Object[] getInventoryStatus(int lowStockThreshold) {
        return (Object[]) entityManager.createNativeQuery("""
            SELECT 
                COUNT(DISTINCT p.id),
                COUNT(DISTINCT CASE WHEN pv.quantity > 0 THEN p.id END),
                COUNT(DISTINCT CASE WHEN pv.quantity = 0 THEN p.id END),
                COUNT(DISTINCT CASE WHEN pv.quantity <= :lowStockThreshold AND pv.quantity > 0 THEN p.id END),
                COALESCE(SUM(pv.quantity), 0)
            FROM products p
            LEFT JOIN product_variants pv ON p.id = pv.product_id
            WHERE p.is_active = true
        """)
                .setParameter("lowStockThreshold", lowStockThreshold)
                .getSingleResult();
    }

    @Override
    public Object[] getRecentActivity(LocalDateTime since) {
        return (Object[]) entityManager.createNativeQuery("""
            SELECT 
                (SELECT COUNT(*) FROM orders WHERE created_at >= :since),
                (SELECT COUNT(*) FROM users WHERE created_at >= :since AND role = 'USER'),
                (SELECT COUNT(*) FROM products WHERE created_at >= :since),
                (SELECT COUNT(*) FROM orders WHERE status = 'PENDING' AND created_at >= :since)
        """)
                .setParameter("since", since)
                .getSingleResult();
    }

    @Override
    public List<Object[]> getMonthlyGrowthTrends(LocalDateTime startDate, LocalDateTime endDate) {
        return entityManager.createNativeQuery("""
            SELECT 
                DATE_FORMAT(month_data.month_year, '%Y-%m'),
                COALESCE(order_data.order_count, 0),
                COALESCE(order_data.revenue, 0),
                COALESCE(user_data.new_customers, 0)
            FROM (
                SELECT DATE_FORMAT(created_at, '%Y-%m-01') AS month_year FROM orders 
                WHERE created_at BETWEEN :startDate AND :endDate
                UNION
                SELECT DATE_FORMAT(created_at, '%Y-%m-01') AS month_year FROM users 
                WHERE created_at BETWEEN :startDate AND :endDate
            ) month_data
            LEFT JOIN (
                SELECT DATE_FORMAT(created_at, '%Y-%m-01') AS month_year,
                       COUNT(*) AS order_count, SUM(total) AS revenue
                FROM orders 
                WHERE status = 'DELIVERED' AND created_at BETWEEN :startDate AND :endDate
                GROUP BY DATE_FORMAT(created_at, '%Y-%m-01')
            ) order_data ON month_data.month_year = order_data.month_year
            LEFT JOIN (
                SELECT DATE_FORMAT(created_at, '%Y-%m-01') AS month_year, COUNT(*) AS new_customers
                FROM users 
                WHERE role = 'USER' AND created_at BETWEEN :startDate AND :endDate
                GROUP BY DATE_FORMAT(created_at, '%Y-%m-01')
            ) user_data ON month_data.month_year = user_data.month_year
            ORDER BY month_data.month_year
        """)
                .setParameter("startDate", startDate)
                .setParameter("endDate", endDate)
                .getResultList();
    }
}
