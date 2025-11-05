package com.ecommerce.service;

import com.ecommerce.dto.request.LoginRequest;
import com.ecommerce.dto.request.RefreshTokenRequest;
import com.ecommerce.dto.request.RegisterRequest;
import com.ecommerce.dto.response.JwtAuthenticationResponse;
import com.ecommerce.dto.response.UserInfoResponse;
import com.ecommerce.entity.Role;
import com.ecommerce.entity.User;
import com.ecommerce.exception.AuthenticationException;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.security.JwtTokenProvider;
import com.ecommerce.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthService {
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtTokenProvider tokenProvider;
    
    @Value("${jwt.expiration}")
    private long jwtExpirationMs;
    
    public JwtAuthenticationResponse login(LoginRequest loginRequest) {
        // Normalize email to lowercase for case-insensitive login
        String normalizedEmail = loginRequest.getEmail().toLowerCase().trim();
        
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                normalizedEmail,
                loginRequest.getPassword()
            )
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        String accessToken = tokenProvider.generateToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(authentication);
        
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        UserInfoResponse userInfo = new UserInfoResponse();
        userInfo.setId(userPrincipal.getId());
        userInfo.setEmail(userPrincipal.getEmail());
        userInfo.setFirstName(userPrincipal.getFirstName());
        userInfo.setLastName(userPrincipal.getLastName());
        userInfo.setRole(userPrincipal.getRole());
        userInfo.setActive(userPrincipal.getActive());
        
        return new JwtAuthenticationResponse(accessToken, refreshToken, jwtExpirationMs, userInfo);
    }
    
    public JwtAuthenticationResponse register(RegisterRequest registerRequest) {
        // Check if user already exists
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new AuthenticationException("Email is already registered");
        }
        
        // Validate email format (additional validation beyond annotation)
        if (!isValidEmail(registerRequest.getEmail())) {
            throw new AuthenticationException("Invalid email format");
        }
        
        // Create new user
        User user = new User();
        user.setEmail(registerRequest.getEmail().toLowerCase().trim());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setFirstName(registerRequest.getFirstName().trim());
        user.setLastName(registerRequest.getLastName().trim());
        user.setPhone(registerRequest.getPhone() != null ? registerRequest.getPhone().trim() : null);
        user.setAddress(registerRequest.getAddress() != null ? registerRequest.getAddress().trim() : null);
        user.setRole(Role.ROLE_USER); // Default role for registration
        user.setActive(true);
        
        User savedUser = userRepository.save(user);
        
        // Authenticate the newly created user
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                registerRequest.getEmail().toLowerCase().trim(),
                registerRequest.getPassword()
            )
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        String accessToken = tokenProvider.generateToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(authentication);
        
        UserInfoResponse userInfo = new UserInfoResponse(savedUser);
        
        return new JwtAuthenticationResponse(accessToken, refreshToken, jwtExpirationMs, userInfo);
    }
    
    public JwtAuthenticationResponse refreshToken(RefreshTokenRequest refreshTokenRequest) {
        String refreshToken = refreshTokenRequest.getRefreshToken();
        
        if (!tokenProvider.validateToken(refreshToken)) {
            throw new AuthenticationException("Invalid refresh token");
        }
        
        if (!tokenProvider.isRefreshToken(refreshToken)) {
            throw new AuthenticationException("Token is not a refresh token");
        }
        
        Long userId = tokenProvider.getUserIdFromToken(refreshToken);
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new AuthenticationException("User not found"));
        
        if (!user.getActive()) {
            throw new AuthenticationException("User account is disabled");
        }
        
        String newAccessToken = tokenProvider.generateTokenFromUserId(
            user.getId(), 
            user.getEmail(), 
            user.getRole().name()
        );
        
        UserInfoResponse userInfo = new UserInfoResponse(user);
        
        return new JwtAuthenticationResponse(newAccessToken, refreshToken, jwtExpirationMs, userInfo);
    }
    
    public void logout() {
        SecurityContextHolder.clearContext();
    }
    
    private boolean isValidEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }
        
        String emailRegex = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
        return email.matches(emailRegex);
    }
}