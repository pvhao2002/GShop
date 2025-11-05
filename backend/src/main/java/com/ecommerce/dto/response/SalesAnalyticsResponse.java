package com.ecommerce.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class SalesAnalyticsResponse {
    
    private List<DailySalesData> dailySales;
    private List<MonthlySalesData> monthlySales;
    private BigDecimal totalRevenue;
    private Long totalOrders;
    private BigDecimal averageOrderValue;
    private PaymentMethodStats paymentMethodStats;
    
    public SalesAnalyticsResponse() {}
    
    public SalesAnalyticsResponse(List<DailySalesData> dailySales, List<MonthlySalesData> monthlySales,
                                BigDecimal totalRevenue, Long totalOrders, BigDecimal averageOrderValue,
                                PaymentMethodStats paymentMethodStats) {
        this.dailySales = dailySales;
        this.monthlySales = monthlySales;
        this.totalRevenue = totalRevenue;
        this.totalOrders = totalOrders;
        this.averageOrderValue = averageOrderValue;
        this.paymentMethodStats = paymentMethodStats;
    }
    
    // Getters and Setters
    public List<DailySalesData> getDailySales() {
        return dailySales;
    }
    
    public void setDailySales(List<DailySalesData> dailySales) {
        this.dailySales = dailySales;
    }
    
    public List<MonthlySalesData> getMonthlySales() {
        return monthlySales;
    }
    
    public void setMonthlySales(List<MonthlySalesData> monthlySales) {
        this.monthlySales = monthlySales;
    }
    
    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }
    
    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }
    
    public Long getTotalOrders() {
        return totalOrders;
    }
    
    public void setTotalOrders(Long totalOrders) {
        this.totalOrders = totalOrders;
    }
    
    public BigDecimal getAverageOrderValue() {
        return averageOrderValue;
    }
    
    public void setAverageOrderValue(BigDecimal averageOrderValue) {
        this.averageOrderValue = averageOrderValue;
    }
    
    public PaymentMethodStats getPaymentMethodStats() {
        return paymentMethodStats;
    }
    
    public void setPaymentMethodStats(PaymentMethodStats paymentMethodStats) {
        this.paymentMethodStats = paymentMethodStats;
    }
    
    // Inner classes for nested data
    public static class DailySalesData {
        private LocalDate date;
        private Long orderCount;
        private BigDecimal revenue;
        
        public DailySalesData() {}
        
        public DailySalesData(LocalDate date, Long orderCount, BigDecimal revenue) {
            this.date = date;
            this.orderCount = orderCount;
            this.revenue = revenue;
        }
        
        public LocalDate getDate() {
            return date;
        }
        
        public void setDate(LocalDate date) {
            this.date = date;
        }
        
        public Long getOrderCount() {
            return orderCount;
        }
        
        public void setOrderCount(Long orderCount) {
            this.orderCount = orderCount;
        }
        
        public BigDecimal getRevenue() {
            return revenue;
        }
        
        public void setRevenue(BigDecimal revenue) {
            this.revenue = revenue;
        }
    }
    
    public static class MonthlySalesData {
        private Integer year;
        private Integer month;
        private Long orderCount;
        private BigDecimal revenue;
        
        public MonthlySalesData() {}
        
        public MonthlySalesData(Integer year, Integer month, Long orderCount, BigDecimal revenue) {
            this.year = year;
            this.month = month;
            this.orderCount = orderCount;
            this.revenue = revenue;
        }
        
        public Integer getYear() {
            return year;
        }
        
        public void setYear(Integer year) {
            this.year = year;
        }
        
        public Integer getMonth() {
            return month;
        }
        
        public void setMonth(Integer month) {
            this.month = month;
        }
        
        public Long getOrderCount() {
            return orderCount;
        }
        
        public void setOrderCount(Long orderCount) {
            this.orderCount = orderCount;
        }
        
        public BigDecimal getRevenue() {
            return revenue;
        }
        
        public void setRevenue(BigDecimal revenue) {
            this.revenue = revenue;
        }
    }
    
    public static class PaymentMethodStats {
        private Long codOrders;
        private Long momoOrders;
        private Long vnpayOrders;
        private BigDecimal codRevenue;
        private BigDecimal momoRevenue;
        private BigDecimal vnpayRevenue;
        
        public PaymentMethodStats() {}
        
        public PaymentMethodStats(Long codOrders, Long momoOrders, Long vnpayOrders,
                                BigDecimal codRevenue, BigDecimal momoRevenue, BigDecimal vnpayRevenue) {
            this.codOrders = codOrders;
            this.momoOrders = momoOrders;
            this.vnpayOrders = vnpayOrders;
            this.codRevenue = codRevenue;
            this.momoRevenue = momoRevenue;
            this.vnpayRevenue = vnpayRevenue;
        }
        
        public Long getCodOrders() {
            return codOrders;
        }
        
        public void setCodOrders(Long codOrders) {
            this.codOrders = codOrders;
        }
        
        public Long getMomoOrders() {
            return momoOrders;
        }
        
        public void setMomoOrders(Long momoOrders) {
            this.momoOrders = momoOrders;
        }
        
        public Long getVnpayOrders() {
            return vnpayOrders;
        }
        
        public void setVnpayOrders(Long vnpayOrders) {
            this.vnpayOrders = vnpayOrders;
        }
        
        public BigDecimal getCodRevenue() {
            return codRevenue;
        }
        
        public void setCodRevenue(BigDecimal codRevenue) {
            this.codRevenue = codRevenue;
        }
        
        public BigDecimal getMomoRevenue() {
            return momoRevenue;
        }
        
        public void setMomoRevenue(BigDecimal momoRevenue) {
            this.momoRevenue = momoRevenue;
        }
        
        public BigDecimal getVnpayRevenue() {
            return vnpayRevenue;
        }
        
        public void setVnpayRevenue(BigDecimal vnpayRevenue) {
            this.vnpayRevenue = vnpayRevenue;
        }
    }
}