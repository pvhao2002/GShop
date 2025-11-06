package com.ecommerce.service;

import com.ecommerce.dto.auth.*;
import com.ecommerce.entity.Address;
import com.ecommerce.entity.Role;
import com.ecommerce.entity.User;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.security.JwtUtil;
import com.ecommerce.security.UserPrincipal;
import com.ecommerce.util.LoggingUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.util.UUID;

/**
 * Service class for authentication operations including registration, login, and token management
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    /**
     * Register a new user account
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String clientIp = getClientIpAddress();
        log.info("Attempting to register user with email: {}", request.getEmail());

        // Check if user already exists
        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            LoggingUtils.logAuthenticationFailure(request.getEmail(), clientIp, "Email already registered");
            throw new RuntimeException("Email is already registered");
        }

        // Create address if provided
        Address address = null;
        if (request.getStreet() != null || request.getCity() != null) {
            address = new Address(
                    request.getStreet(),
                    request.getCity(),
                    request.getState(),
                    request.getZipCode(),
                    request.getCountry()
            );
        }

        // Create new user
        User user = User.builder()
                .email(request.getEmail().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .address(address)
                .role(Role.USER)
                .isActive(true)
                .build();

        User savedUser = userRepository.save(user);
        log.info("User registered successfully with ID: {}", savedUser.getId());
        
        // Log security event
        LoggingUtils.logUserRegistration(savedUser.getEmail(), clientIp);
        LoggingUtils.setUserContext(savedUser.getId().toString(), savedUser.getEmail());

        // Generate tokens
        UserDetails userDetails = UserPrincipal.create(savedUser);
        String token = jwtUtil.generateToken(userDetails);
        String refreshToken = jwtUtil.generateRefreshToken(userDetails);

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .type("Bearer")
                .id(savedUser.getId())
                .email(savedUser.getEmail())
                .firstName(savedUser.getFirstName())
                .lastName(savedUser.getLastName())
                .role(savedUser.getRole().name())
                .build();
    }

    /**
     * Authenticate user and generate JWT tokens
     */
    public AuthResponse login(LoginRequest request) {
        String clientIp = getClientIpAddress();
        log.info("Attempting to authenticate user with email: {}", request.getEmail());

        try {
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail().toLowerCase(),
                            request.getPassword()
                    )
            );

            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            User user = userPrincipal.getUser();

            // Check if user is active
            if (!user.getIsActive()) {
                LoggingUtils.logAuthenticationFailure(request.getEmail(), clientIp, "Account deactivated");
                throw new RuntimeException("Account is deactivated");
            }

            // Generate tokens
            String token = jwtUtil.generateToken(userPrincipal);
            String refreshToken = jwtUtil.generateRefreshToken(userPrincipal);

            // Log successful authentication
            LoggingUtils.logAuthenticationSuccess(user.getEmail(), clientIp);
            LoggingUtils.setUserContext(user.getId().toString(), user.getEmail());
            log.info("User authenticated successfully: {}", user.getEmail());

            return AuthResponse.builder()
                    .token(token)
                    .refreshToken(refreshToken)
                    .type("Bearer")
                    .id(user.getId())
                    .email(user.getEmail())
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .role(user.getRole().name())
                    .build();

        } catch (BadCredentialsException e) {
            LoggingUtils.logAuthenticationFailure(request.getEmail(), clientIp, "Invalid credentials");
            log.warn("Authentication failed for email: {}", request.getEmail());
            throw new RuntimeException("Invalid email or password");
        }
    }

    /**
     * Refresh JWT token using refresh token
     */
    public AuthResponse refreshToken(String refreshToken) {
        String clientIp = getClientIpAddress();
        log.info("Attempting to refresh token");

        try {
            // Validate refresh token
            if (!jwtUtil.isTokenValid(refreshToken)) {
                throw new RuntimeException("Invalid refresh token");
            }

            // Extract username from refresh token
            String email = jwtUtil.getUsernameFromToken(refreshToken);
            User user = userRepository.findByEmailIgnoreCase(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Check if user is active
            if (!user.getIsActive()) {
                LoggingUtils.logAuthenticationFailure(email, clientIp, "Account deactivated during token refresh");
                throw new RuntimeException("Account is deactivated");
            }

            // Generate new tokens
            UserDetails userDetails = UserPrincipal.create(user);
            String newToken = jwtUtil.generateToken(userDetails);
            String newRefreshToken = jwtUtil.generateRefreshToken(userDetails);

            // Log token refresh
            LoggingUtils.logTokenRefresh(user.getEmail(), clientIp);
            LoggingUtils.setUserContext(user.getId().toString(), user.getEmail());
            log.info("Token refreshed successfully for user: {}", user.getEmail());

            return AuthResponse.builder()
                    .token(newToken)
                    .refreshToken(newRefreshToken)
                    .type("Bearer")
                    .id(user.getId())
                    .email(user.getEmail())
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .role(user.getRole().name())
                    .build();

        } catch (Exception e) {
            log.error("Token refresh failed: {}", e.getMessage());
            throw new RuntimeException("Token refresh failed");
        }
    }

    /**
     * Initiate forgot password process
     */
    public void forgotPassword(String email) {
        String clientIp = getClientIpAddress();
        log.info("Forgot password request for email: {}", email);

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        // Generate reset token (in a real implementation, this would be stored in database)
        String resetToken = UUID.randomUUID().toString();
        
        // TODO: Store reset token in database with expiration
        // TODO: Send email with reset link
        
        // Log security event
        LoggingUtils.logPasswordResetRequest(user.getEmail(), clientIp);
        log.info("Password reset token generated for user: {}", user.getEmail());
        // For now, just log the token (in production, this would be sent via email)
        log.info("Reset token (for testing): {}", resetToken);
    }

    /**
     * Reset user password using reset token
     */
    @Transactional
    public void resetPassword(String token, String newPassword) {
        log.info("Attempting to reset password with token: {}", token);

        // TODO: Validate reset token from database
        // For now, this is a placeholder implementation
        
        // In a real implementation:
        // 1. Find user by reset token
        // 2. Check if token is not expired
        // 3. Update user password
        // 4. Invalidate reset token
        
        log.info("Password reset functionality not fully implemented yet");
        throw new RuntimeException("Password reset functionality is not yet implemented");
    }

    /**
     * Get client IP address from current request
     */
    private String getClientIpAddress() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.currentRequestAttributes();
            HttpServletRequest request = attributes.getRequest();
            return LoggingUtils.getClientIpAddress(request);
        } catch (Exception e) {
            return "unknown";
        }
    }
}