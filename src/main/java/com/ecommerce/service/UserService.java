package com.ecommerce.service;

import com.ecommerce.dto.admin.UpdateUserStatusRequest;
import com.ecommerce.dto.admin.UserResponse;
import com.ecommerce.dto.common.MessageResponse;
import com.ecommerce.dto.common.PagedResponse;
import com.ecommerce.dto.user.ChangePasswordRequest;
import com.ecommerce.dto.user.UpdateUserProfileRequest;
import com.ecommerce.dto.user.UserProfileResponse;

/**
 * Service interface for user management operations.
 * Handles both admin functionality and user profile management.
 */
public interface UserService {
    
    // Admin methods
    
    /**
     * Get all users with pagination and optional search.
     * Admin-only method to retrieve all users in the system.
     * 
     * @param page Page number (0-based)
     * @param size Page size
     * @param search Optional search term for email, name, or phone
     * @return Paginated list of users
     */
    PagedResponse<UserResponse> getAllUsers(int page, int size, String search);
    
    /**
     * Update user account status (active/inactive).
     * Admin-only method to enable or disable user accounts.
     * 
     * @param userId User ID
     * @param request Status update request
     * @return Updated user response
     */
    UserResponse updateUserStatus(Long userId, UpdateUserStatusRequest request);
    
    /**
     * Get user details by ID.
     * Admin-only method to retrieve detailed user information.
     * 
     * @param userId User ID
     * @return User details with statistics
     */
    UserResponse getUserById(Long userId);
    
    // User profile methods
    
    /**
     * Get user profile information.
     * Returns the authenticated user's profile data.
     * 
     * @param userEmail Email of the authenticated user
     * @return User profile information
     */
    UserProfileResponse getUserProfile(String userEmail);
    
    /**
     * Update user profile information.
     * Updates the authenticated user's profile with validation and security checks.
     * 
     * @param userEmail Email of the authenticated user
     * @param request Profile update request
     * @return Updated user profile
     */
    UserProfileResponse updateUserProfile(String userEmail, UpdateUserProfileRequest request);
    
    /**
     * Change user password.
     * Changes the authenticated user's password with current password verification.
     * 
     * @param userEmail Email of the authenticated user
     * @param request Password change request
     * @return Success message
     */
    MessageResponse changePassword(String userEmail, ChangePasswordRequest request);
}