package com.ecommerce.repository;

import com.ecommerce.entity.Role;
import com.ecommerce.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for User entity operations.
 * Provides custom query methods for email lookup and user management.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {
    
    /**
     * Find user by email address (case-insensitive).
     * Used for authentication and user lookup.
     */
    Optional<User> findByEmailIgnoreCase(String email);
    
    /**
     * Find user by email address.
     * Used for profile operations.
     */
    Optional<User> findByEmail(String email);
    
    /**
     * Check if user exists by email address (case-insensitive).
     * Used for registration validation.
     */
    boolean existsByEmailIgnoreCase(String email);
    
    /**
     * Check if email exists for another user (excluding current user).
     * Used for profile update validation.
     */
    boolean existsByEmailAndIdNot(String email, Long id);
    
    /**
     * Find users by role.
     * Used for admin user management.
     */
    Page<User> findByRole(Role role, Pageable pageable);
    
    /**
     * Find users by active status.
     * Used for admin user management.
     */
    Page<User> findByIsActive(Boolean isActive, Pageable pageable);
    
    /**
     * Find users by role and active status.
     * Used for admin user management and filtering.
     */
    Page<User> findByRoleAndIsActive(Role role, Boolean isActive, Pageable pageable);
    
    /**
     * Search users by name or email (case-insensitive).
     * Used for admin user search functionality.
     */
    @Query("SELECT u FROM User u WHERE " +
           "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<User> searchUsers(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    /**
     * Find users created within a date range.
     * Used for admin analytics and reporting.
     */
    @Query("SELECT u FROM User u WHERE u.createdAt BETWEEN :startDate AND :endDate")
    Page<User> findByCreatedAtBetween(@Param("startDate") LocalDateTime startDate, 
                                     @Param("endDate") LocalDateTime endDate, 
                                     Pageable pageable);
    
    /**
     * Count total active users.
     * Used for dashboard metrics.
     */
    long countByIsActive(Boolean isActive);
    
    /**
     * Count users by role.
     * Used for dashboard metrics.
     */
    long countByRole(Role role);
    
    /**
     * Advanced user search with multiple filters.
     * Used for comprehensive admin user filtering.
     */
    @Query("SELECT u FROM User u WHERE " +
           "(:role IS NULL OR u.role = :role) AND " +
           "(:isActive IS NULL OR u.isActive = :isActive) AND " +
           "(:searchTerm IS NULL OR " +
           "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND " +
           "(:startDate IS NULL OR u.createdAt >= :startDate) AND " +
           "(:endDate IS NULL OR u.createdAt <= :endDate)")
    Page<User> findWithFilters(@Param("role") Role role,
                              @Param("isActive") Boolean isActive,
                              @Param("searchTerm") String searchTerm,
                              @Param("startDate") LocalDateTime startDate,
                              @Param("endDate") LocalDateTime endDate,
                              Pageable pageable);
    
    /**
     * Get user statistics for dashboard.
     * Returns total users, active users, admins, and new registrations.
     */
    @Query("SELECT " +
           "COUNT(u) as totalUsers, " +
           "SUM(CASE WHEN u.isActive = true THEN 1 ELSE 0 END) as activeUsers, " +
           "SUM(CASE WHEN u.role = 'ADMIN' THEN 1 ELSE 0 END) as adminUsers, " +
           "SUM(CASE WHEN u.role = 'USER' THEN 1 ELSE 0 END) as regularUsers " +
           "FROM User u")
    Object[] getUserStatistics();
    
    /**
     * Find users with recent activity (recent orders).
     * Used for user engagement analysis.
     */
    @Query("SELECT DISTINCT u FROM User u JOIN u.orders o WHERE o.createdAt >= :since")
    List<User> findUsersWithRecentActivity(@Param("since") LocalDateTime since);
    
    /**
     * Find inactive users (no orders in specified period).
     * Used for user retention analysis.
     */
    @Query("SELECT u FROM User u WHERE u.role = 'USER' AND " +
           "(NOT EXISTS (SELECT o FROM Order o WHERE o.user = u) OR " +
           "NOT EXISTS (SELECT o FROM Order o WHERE o.user = u AND o.createdAt >= :since))")
    List<User> findInactiveUsers(@Param("since") LocalDateTime since);
    
    /**
     * Get user registration trends by month.
     * Used for dashboard analytics and growth tracking.
     */
    @Query("SELECT YEAR(u.createdAt) as year, MONTH(u.createdAt) as month, COUNT(u) as registrations " +
           "FROM User u WHERE u.createdAt BETWEEN :startDate AND :endDate " +
           "GROUP BY YEAR(u.createdAt), MONTH(u.createdAt) ORDER BY year, month")
    List<Object[]> getUserRegistrationTrends(@Param("startDate") LocalDateTime startDate,
                                            @Param("endDate") LocalDateTime endDate);
}