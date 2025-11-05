package com.ecommerce.dto.request;

public class NotificationPreferencesRequest {
    
    private Boolean orderUpdates = true;
    private Boolean promotions = true;
    private Boolean deliveryNotifications = true;
    private Boolean paymentNotifications = true;
    
    public NotificationPreferencesRequest() {}
    
    public Boolean getOrderUpdates() {
        return orderUpdates;
    }
    
    public void setOrderUpdates(Boolean orderUpdates) {
        this.orderUpdates = orderUpdates;
    }
    
    public Boolean getPromotions() {
        return promotions;
    }
    
    public void setPromotions(Boolean promotions) {
        this.promotions = promotions;
    }
    
    public Boolean getDeliveryNotifications() {
        return deliveryNotifications;
    }
    
    public void setDeliveryNotifications(Boolean deliveryNotifications) {
        this.deliveryNotifications = deliveryNotifications;
    }
    
    public Boolean getPaymentNotifications() {
        return paymentNotifications;
    }
    
    public void setPaymentNotifications(Boolean paymentNotifications) {
        this.paymentNotifications = paymentNotifications;
    }
}