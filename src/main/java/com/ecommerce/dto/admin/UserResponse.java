package com.ecommerce.dto.admin;

import com.ecommerce.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO for user information in admin context.
 * Contains user details visible to administrators.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private Role role;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Address information
    private String street;
    private String city;
    private String state;
    private String zipCode;
    private String country;
    
    // Statistics
    private Long totalOrders;
    private Double totalSpent;
    private LocalDateTime lastOrderDate;
}