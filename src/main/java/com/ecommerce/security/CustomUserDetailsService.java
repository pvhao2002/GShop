package com.ecommerce.security;

import com.ecommerce.entity.User;
import com.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Custom UserDetailsService implementation for loading user by email
 * Integrates with Spring Security authentication mechanism
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    /**
     * Load user by username (email) for Spring Security authentication
     * 
     * @param username the email address of the user
     * @return UserDetails implementation containing user information
     * @throws UsernameNotFoundException if user is not found
     */
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        log.debug("Loading user by email: {}", username);
        
        User user = userRepository.findByEmailIgnoreCase(username)
            .orElseThrow(() -> {
                log.warn("User not found with email: {}", username);
                return new UsernameNotFoundException("User not found with email: " + username);
            });

        log.debug("User found: {} with role: {}", user.getEmail(), user.getRole());
        
        // Check if user account is active
        if (!user.getIsActive()) {
            log.warn("User account is inactive: {}", username);
            throw new UsernameNotFoundException("User account is inactive: " + username);
        }

        return UserPrincipal.create(user);
    }

    /**
     * Load user by ID for internal use
     * 
     * @param userId the ID of the user
     * @return UserDetails implementation containing user information
     * @throws UsernameNotFoundException if user is not found
     */
    @Transactional(readOnly = true)
    public UserDetails loadUserById(Long userId) throws UsernameNotFoundException {
        log.debug("Loading user by ID: {}", userId);
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> {
                log.warn("User not found with ID: {}", userId);
                return new UsernameNotFoundException("User not found with ID: " + userId);
            });

        log.debug("User found: {} with role: {}", user.getEmail(), user.getRole());
        
        // Check if user account is active
        if (!user.getIsActive()) {
            log.warn("User account is inactive: {}", user.getEmail());
            throw new UsernameNotFoundException("User account is inactive: " + user.getEmail());
        }

        return UserPrincipal.create(user);
    }

    /**
     * Check if user exists by email
     * 
     * @param email the email address to check
     * @return true if user exists, false otherwise
     */
    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmailIgnoreCase(email);
    }

    /**
     * Get user entity by email
     * 
     * @param email the email address of the user
     * @return User entity
     * @throws UsernameNotFoundException if user is not found
     */
    @Transactional(readOnly = true)
    public User getUserByEmail(String email) throws UsernameNotFoundException {
        return userRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> {
                log.warn("User not found with email: {}", email);
                return new UsernameNotFoundException("User not found with email: " + email);
            });
    }

    /**
     * Get user entity by ID
     * 
     * @param userId the ID of the user
     * @return User entity
     * @throws UsernameNotFoundException if user is not found
     */
    @Transactional(readOnly = true)
    public User getUserById(Long userId) throws UsernameNotFoundException {
        return userRepository.findById(userId)
            .orElseThrow(() -> {
                log.warn("User not found with ID: {}", userId);
                return new UsernameNotFoundException("User not found with ID: " + userId);
            });
    }
}