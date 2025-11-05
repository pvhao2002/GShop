package com.ecommerce.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class UserAnalyticsResponse {
    
    private Long totalUsers;
    private Long activeUsers;
    private Long newUsersThisMonth;
    private List<UserRegistrationData> userRegistrationTrend;
    private List<TopCustomer> topCustomers;
    private CustomerActivityStats activityStats;
    
    public UserAnalyticsResponse() {}
    
    public UserAnalyticsResponse(Long totalUsers, Long activeUsers, Long newUsersThisMonth,
                               List<UserRegistrationData> userRegistrationTrend,
                               List<TopCustomer> topCustomers, CustomerActivityStats activityStats) {
        this.totalUsers = totalUsers;
        this.activeUsers = activeUsers;
        this.newUsersThisMonth = newUsersThisMonth;
        this.userRegistrationTrend = userRegistrationTrend;
        this.topCustomers = topCustomers;
        this.activityStats = activityStats;
    }
    
    // Getters and Setters
    public Long getTotalUsers() {
        return totalUsers;
    }
    
    public void setTotalUsers(Long totalUsers) {
        this.totalUsers = totalUsers;
    }
    
    public Long getActiveUsers() {
        return activeUsers;
    }
    
    public void setActiveUsers(Long activeUsers) {
        this.activeUsers = activeUsers;
    }
    
    public Long getNewUsersThisMonth() {
        return newUsersThisMonth;
    }
    
    public void setNewUsersThisMonth(Long newUsersThisMonth) {
        this.newUsersThisMonth = newUsersThisMonth;
    }
    
    public List<UserRegistrationData> getUserRegistrationTrend() {
        return userRegistrationTrend;
    }
    
    public void setUserRegistrationTrend(List<UserRegistrationData> userRegistrationTrend) {
        this.userRegistrationTrend = userRegistrationTrend;
    }
    
    public List<TopCustomer> getTopCustomers() {
        return topCustomers;
    }
    
    public void setTopCustomers(List<TopCustomer> topCustomers) {
        this.topCustomers = topCustomers;
    }
    
    public CustomerActivityStats getActivityStats() {
        return activityStats;
    }
    
    public void setActivityStats(CustomerActivityStats activityStats) {
        this.activityStats = activityStats;
    }
    
    // Inner classes for nested data
    public static class UserRegistrationData {
        private LocalDate date;
        private Long registrationCount;
        
        public UserRegistrationData() {}
        
        public UserRegistrationData(LocalDate date, Long registrationCount) {
            this.date = date;
            this.registrationCount = registrationCount;
        }
        
        public LocalDate getDate() {
            return date;
        }
        
        public void setDate(LocalDate date) {
            this.date = date;
        }
        
        public Long getRegistrationCount() {
            return registrationCount;
        }
        
        public void setRegistrationCount(Long registrationCount) {
            this.registrationCount = registrationCount;
        }
    }
    
    public static class TopCustomer {
        private Long userId;
        private String customerName;
        private String email;
        private Long totalOrders;
        private BigDecimal totalSpent;
        private BigDecimal averageOrderValue;
        
        public TopCustomer() {}
        
        public TopCustomer(Long userId, String customerName, String email,
                         Long totalOrders, BigDecimal totalSpent, BigDecimal averageOrderValue) {
            this.userId = userId;
            this.customerName = customerName;
            this.email = email;
            this.totalOrders = totalOrders;
            this.totalSpent = totalSpent;
            this.averageOrderValue = averageOrderValue;
        }
        
        public Long getUserId() {
            return userId;
        }
        
        public void setUserId(Long userId) {
            this.userId = userId;
        }
        
        public String getCustomerName() {
            return customerName;
        }
        
        public void setCustomerName(String customerName) {
            this.customerName = customerName;
        }
        
        public String getEmail() {
            return email;
        }
        
        public void setEmail(String email) {
            this.email = email;
        }
        
        public Long getTotalOrders() {
            return totalOrders;
        }
        
        public void setTotalOrders(Long totalOrders) {
            this.totalOrders = totalOrders;
        }
        
        public BigDecimal getTotalSpent() {
            return totalSpent;
        }
        
        public void setTotalSpent(BigDecimal totalSpent) {
            this.totalSpent = totalSpent;
        }
        
        public BigDecimal getAverageOrderValue() {
            return averageOrderValue;
        }
        
        public void setAverageOrderValue(BigDecimal averageOrderValue) {
            this.averageOrderValue = averageOrderValue;
        }
    }
    
    public static class CustomerActivityStats {
        private Long customersWithOrders;
        private Long customersWithoutOrders;
        private BigDecimal averageCustomerLifetimeValue;
        private Long repeatCustomers;
        
        public CustomerActivityStats() {}
        
        public CustomerActivityStats(Long customersWithOrders, Long customersWithoutOrders,
                                   BigDecimal averageCustomerLifetimeValue, Long repeatCustomers) {
            this.customersWithOrders = customersWithOrders;
            this.customersWithoutOrders = customersWithoutOrders;
            this.averageCustomerLifetimeValue = averageCustomerLifetimeValue;
            this.repeatCustomers = repeatCustomers;
        }
        
        public Long getCustomersWithOrders() {
            return customersWithOrders;
        }
        
        public void setCustomersWithOrders(Long customersWithOrders) {
            this.customersWithOrders = customersWithOrders;
        }
        
        public Long getCustomersWithoutOrders() {
            return customersWithoutOrders;
        }
        
        public void setCustomersWithoutOrders(Long customersWithoutOrders) {
            this.customersWithoutOrders = customersWithoutOrders;
        }
        
        public BigDecimal getAverageCustomerLifetimeValue() {
            return averageCustomerLifetimeValue;
        }
        
        public void setAverageCustomerLifetimeValue(BigDecimal averageCustomerLifetimeValue) {
            this.averageCustomerLifetimeValue = averageCustomerLifetimeValue;
        }
        
        public Long getRepeatCustomers() {
            return repeatCustomers;
        }
        
        public void setRepeatCustomers(Long repeatCustomers) {
            this.repeatCustomers = repeatCustomers;
        }
    }
}