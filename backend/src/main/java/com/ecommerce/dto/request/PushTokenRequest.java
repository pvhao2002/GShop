package com.ecommerce.dto.request;

import jakarta.validation.constraints.NotBlank;

public class PushTokenRequest {
    
    @NotBlank(message = "Push token is required")
    private String token;
    
    public PushTokenRequest() {}
    
    public PushTokenRequest(String token) {
        this.token = token;
    }
    
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
}