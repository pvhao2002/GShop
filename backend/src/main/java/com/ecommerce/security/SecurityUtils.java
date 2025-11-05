package com.ecommerce.security;

import com.ecommerce.entity.Role;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtils {
    
    private SecurityUtils() {
        // Utility class
    }
    
    /**
     * Get the current authenticated user
     */
    public static UserPrincipal getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal) {
            return (UserPrincipal) authentication.getPrincipal();
        }
        return null;
    }
    
    /**
     * Get the current user's ID
     */
    public static Long getCurrentUserId() {
        UserPrincipal user = getCurrentUser();
        return user != null ? user.getId() : null;
    }
    
    /**
     * Get the current user's email
     */
    public static String getCurrentUserEmail() {
        UserPrincipal user = getCurrentUser();
        return user != null ? user.getEmail() : null;
    }
    
    /**
     * Get the current user's role
     */
    public static Role getCurrentUserRole() {
        UserPrincipal user = getCurrentUser();
        return user != null ? user.getRole() : null;
    }
    
    /**
     * Check if the current user is authenticated
     */
    public static boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && 
               authentication.isAuthenticated() && 
               authentication.getPrincipal() instanceof UserPrincipal;
    }
    
    /**
     * Check if the current user has admin role
     */
    public static boolean isCurrentUserAdmin() {
        UserPrincipal user = getCurrentUser();
        return user != null && user.isAdmin();
    }
    
    /**
     * Check if the current user has user role
     */
    public static boolean isCurrentUserRegularUser() {
        UserPrincipal user = getCurrentUser();
        return user != null && user.isUser();
    }
    
    /**
     * Check if the current user has the specified role
     */
    public static boolean hasRole(Role role) {
        UserPrincipal user = getCurrentUser();
        return user != null && user.hasRole(role);
    }
    
    /**
     * Check if the current user is the owner of the resource (by user ID)
     */
    public static boolean isResourceOwner(Long resourceUserId) {
        Long currentUserId = getCurrentUserId();
        return currentUserId != null && currentUserId.equals(resourceUserId);
    }
    
    /**
     * Check if the current user can access the resource (owner or admin)
     */
    public static boolean canAccessResource(Long resourceUserId) {
        return isCurrentUserAdmin() || isResourceOwner(resourceUserId);
    }
}