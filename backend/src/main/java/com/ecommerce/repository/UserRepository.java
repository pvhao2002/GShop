package com.ecommerce.repository;

import com.ecommerce.entity.Role;
import com.ecommerce.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Basic authentication queries
    Optional<User> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    boolean existsByEmailAndIdNot(String email, Long id);
    
    // Role-based queries
    List<User> findByRole(Role role);
    
    Page<User> findByRole(Role role, Pageable pageable);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role")
    long countByRole(@Param("role") Role role);
    
    // Active user queries
    List<User> findByActiveTrue();
    
    Page<User> findByActiveTrue(Pageable pageable);
    
    List<User> findByActiveFalse();
    
    // Combined role and active status queries
    List<User> findByRoleAndActiveTrue(Role role);
    
    Page<User> findByRoleAndActiveTrue(Role role, Pageable pageable);
    
    // Search queries
    @Query("SELECT u FROM User u WHERE " +
           "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<User> searchUsers(@Param("keyword") String keyword, Pageable pageable);
    
    @Query("SELECT u FROM User u WHERE u.role = :role AND (" +
           "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<User> searchUsersByRole(@Param("keyword") String keyword, @Param("role") Role role, Pageable pageable);
    
    // Date range queries
    List<User> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.createdAt BETWEEN :startDate AND :endDate")
    long countUsersCreatedBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // Admin management queries
    @Query("SELECT u FROM User u WHERE u.role = 'ROLE_ADMIN' AND u.active = true")
    List<User> findActiveAdmins();
    
    @Query("SELECT u FROM User u WHERE u.role = 'ROLE_USER' AND u.active = true")
    Page<User> findActiveCustomers(Pageable pageable);
    
    // User registration trend statistics
    @Query("SELECT DATE(u.createdAt) as registrationDate, COUNT(u) as registrationCount " +
           "FROM User u WHERE u.role = 'ROLE_USER' AND u.createdAt BETWEEN :startDate AND :endDate " +
           "GROUP BY DATE(u.createdAt) ORDER BY DATE(u.createdAt)")
    List<Object[]> getUserRegistrationTrend(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // Customer statistics
    @Query("SELECT COUNT(u) FROM User u WHERE u.role = 'ROLE_USER'")
    long getTotalCustomerCount();
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.role = 'ROLE_USER' AND u.active = true")
    long getActiveCustomerCount();
}