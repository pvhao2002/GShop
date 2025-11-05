package com.ecommerce.dto.request;

import com.ecommerce.entity.OrderStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class UpdateOrderStatusRequest {
    
    @NotNull(message = "Order status is required")
    private OrderStatus status;
    
    @Size(max = 500, message = "Status notes cannot exceed 500 characters")
    private String statusNotes;
    
    private String trackingNumber;
    
    // Default constructor
    public UpdateOrderStatusRequest() {}
    
    // Constructor with required fields
    public UpdateOrderStatusRequest(OrderStatus status) {
        this.status = status;
    }
    
    // Getters and Setters
    public OrderStatus getStatus() {
        return status;
    }
    
    public void setStatus(OrderStatus status) {
        this.status = status;
    }
    
    public String getStatusNotes() {
        return statusNotes;
    }
    
    public void setStatusNotes(String statusNotes) {
        this.statusNotes = statusNotes;
    }
    
    public String getTrackingNumber() {
        return trackingNumber;
    }
    
    public void setTrackingNumber(String trackingNumber) {
        this.trackingNumber = trackingNumber;
    }
}