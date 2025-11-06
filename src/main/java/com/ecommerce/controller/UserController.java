package com.ecommerce.controller;

import com.ecommerce.dto.common.MessageResponse;
import com.ecommerce.dto.user.ChangePasswordRequest;
import com.ecommerce.dto.user.UpdateUserProfileRequest;
import com.ecommerce.dto.user.UserProfileResponse;
import com.ecommerce.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for user profile management operations.
 * Handles user profile retrieval, updates, and password changes.
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {
    
    private final UserService userService;
    
    /**
     * Get current user's profile information.
     * Returns the authenticated user's profile data.
     * 
     * @param authentication Current user authentication
     * @return User profile information
     */
    @GetMapping("/profile")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<UserProfileResponse> getUserProfile(Authentication authentication) {
        log.info("Getting profile for user: {}", authentication.getName());
        
        UserProfileResponse profile = userService.getUserProfile(authentication.getName());
        
        return ResponseEntity.ok(profile);
    }
    
    /**
     * Update current user's profile information.
     * Updates the authenticated user's profile with validation and security checks.
     * 
     * @param authentication Current user authentication
     * @param request Profile update request
     * @return Updated user profile
     */
    @PutMapping("/profile")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<UserProfileResponse> updateUserProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateUserProfileRequest request) {
        
        log.info("Updating profile for user: {}", authentication.getName());
        
        UserProfileResponse updatedProfile = userService.updateUserProfile(
                authentication.getName(), request);
        
        return ResponseEntity.ok(updatedProfile);
    }
    
    /**
     * Change current user's password.
     * Changes the authenticated user's password with current password verification.
     * 
     * @param authentication Current user authentication
     * @param request Password change request
     * @return Success message
     */
    @PutMapping("/change-password")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<MessageResponse> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {
        
        log.info("Changing password for user: {}", authentication.getName());
        
        MessageResponse response = userService.changePassword(
                authentication.getName(), request);
        
        return ResponseEntity.ok(response);
    }
}