package com.ecommerce.controller;

import com.ecommerce.dto.auth.*;
import com.ecommerce.dto.common.MessageResponse;
import com.ecommerce.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for authentication operations
 * Handles user registration, login, token refresh, and password reset
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    /**
     * Register a new user account
     * 
     * @param request Registration request with user details
     * @return Authentication response with JWT tokens and user info
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        log.info("Registration request received for email: {}", request.getEmail());
        
        try {
            AuthResponse response = authService.register(request);
            log.info("User registered successfully: {}", request.getEmail());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("Registration failed for email {}: {}", request.getEmail(), e.getMessage());
            throw e;
        }
    }

    /**
     * Authenticate user and generate JWT tokens
     * 
     * @param request Login request with email and password
     * @return Authentication response with JWT tokens and user info
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> loginUser(@Valid @RequestBody LoginRequest request) {
        log.info("Login request received for email: {}", request.getEmail());
        
        try {
            AuthResponse response = authService.login(request, null);
            log.info("User logged in successfully: {}", request.getEmail());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Login failed for email {}: {}", request.getEmail(), e.getMessage());
            throw e;
        }
    }

    @PostMapping("/login-admin")
    public ResponseEntity<AuthResponse> loginAdmin(@Valid @RequestBody LoginRequest request) {
        log.info("Login admin request received for email: {}", request.getEmail());

        try {
            AuthResponse response = authService.login(request, Boolean.TRUE);
            log.info("User admin logged in successfully: {}", request.getEmail());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Login admin failed for email {}: {}", request.getEmail(), e.getMessage());
            throw e;
        }
    }

    /**
     * Refresh JWT token using refresh token
     * 
     * @param request Refresh token request
     * @return New authentication response with refreshed tokens
     */
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        log.info("Token refresh request received");
        
        try {
            AuthResponse response = authService.refreshToken(request.getRefreshToken());
            log.info("Token refreshed successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Token refresh failed: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Initiate forgot password process
     * 
     * @param request Forgot password request with email
     * @return Success message
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<MessageResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        log.info("Forgot password request received for email: {}", request.getEmail());
        
        try {
            authService.forgotPassword(request.getEmail());
            log.info("Forgot password process initiated for email: {}", request.getEmail());
            return ResponseEntity.ok(MessageResponse.of(
                "If an account with that email exists, a password reset link has been sent."
            ));
        } catch (Exception e) {
            log.error("Forgot password failed for email {}: {}", request.getEmail(), e.getMessage());
            // Return success message even if user not found for security reasons
            return ResponseEntity.ok(MessageResponse.of(
                "If an account with that email exists, a password reset link has been sent."
            ));
        }
    }

    /**
     * Reset user password using reset token
     * 
     * @param request Reset password request with token and new password
     * @return Success message
     */
    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        log.info("Password reset request received");
        
        try {
            authService.resetPassword(request.getToken(), request.getNewPassword());
            log.info("Password reset successfully");
            return ResponseEntity.ok(MessageResponse.of("Password has been reset successfully."));
        } catch (Exception e) {
            log.error("Password reset failed: {}", e.getMessage());
            throw e;
        }
    }
}