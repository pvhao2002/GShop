package com.ecommerce.controller;

import com.ecommerce.dto.request.ChangePasswordRequest;
import com.ecommerce.dto.request.PushTokenRequest;
import com.ecommerce.dto.request.UpdateProfileRequest;
import com.ecommerce.dto.response.ApiResponse;
import com.ecommerce.dto.response.UserInfoResponse;
import com.ecommerce.entity.User;
import com.ecommerce.security.SecurityUtils;
import com.ecommerce.service.NotificationService;
import com.ecommerce.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/users")
@Tag(name = "User Management", description = "User profile management and account operations")
@SecurityRequirement(name = "bearerAuth")
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class UserController {
    private final UserService userService;
    private final NotificationService notificationService;

    @GetMapping("/profile")
    @Operation(summary = "Get current user profile", description = "Retrieve the authenticated user's profile information")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<UserInfoResponse> getCurrentUserProfile() {
        Long userId = SecurityUtils.getCurrentUserId();
        UserInfoResponse userProfile = userService.getUserProfile(userId);
        return ResponseEntity.ok(userProfile);
    }
    
    @PutMapping("/profile")
    @Operation(summary = "Update user profile", description = "Update the authenticated user's profile information")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<UserInfoResponse> updateProfile(@Valid @RequestBody UpdateProfileRequest updateRequest) {
        Long userId = SecurityUtils.getCurrentUserId();
        UserInfoResponse updatedProfile = userService.updateUserProfile(userId, updateRequest);
        return ResponseEntity.ok(updatedProfile);
    }
    
    @GetMapping("/{userId}")
    @Operation(summary = "Get user by ID", description = "Retrieve user information by ID (Admin only)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserInfoResponse> getUserById(@PathVariable Long userId) {
        UserInfoResponse userProfile = userService.getUserProfile(userId);
        return ResponseEntity.ok(userProfile);
    }
    
    @PutMapping("/{userId}/status")
    @Operation(summary = "Update user status", description = "Enable or disable user account (Admin only)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserInfoResponse> updateUserStatus(
            @PathVariable Long userId, 
            @RequestParam Boolean active) {
        UserInfoResponse updatedUser = userService.updateUserStatus(userId, active);
        return ResponseEntity.ok(updatedUser);
    }
    
    @PutMapping("/change-password")
    @Operation(summary = "Change password", description = "Change the authenticated user's password")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> changePassword(@Valid @RequestBody ChangePasswordRequest changePasswordRequest) {
        Long userId = SecurityUtils.getCurrentUserId();
        userService.changePassword(userId, changePasswordRequest);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully"));
    }
    
    @PostMapping("/push-token")
    @Operation(summary = "Register push notification token", description = "Register device push token for notifications")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> registerPushToken(@Valid @RequestBody PushTokenRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        User user = userService.findById(userId);
        
        notificationService.updatePushToken(user, request.getToken());
        userService.save(user);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Push token registered successfully");
        
        return ResponseEntity.ok(response);
    }
}