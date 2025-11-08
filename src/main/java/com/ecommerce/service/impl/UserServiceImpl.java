package com.ecommerce.service.impl;

import com.ecommerce.dto.admin.UpdateUserStatusRequest;
import com.ecommerce.dto.admin.UserResponse;
import com.ecommerce.dto.common.MessageResponse;
import com.ecommerce.dto.common.PagedResponse;
import com.ecommerce.dto.user.ChangePasswordRequest;
import com.ecommerce.dto.user.UpdateUserProfileRequest;
import com.ecommerce.dto.user.UserProfileResponse;
import com.ecommerce.entity.Address;
import com.ecommerce.entity.User;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.exception.ValidationException;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of UserService for admin user management operations.
 * Handles user retrieval, status updates, and user analytics.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<UserResponse> getAllUsers(int page, int size, String search) {
        log.info("Admin retrieving all users - page: {}, size: {}, search: {}", page, size, search);

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        // Build specification for search
        Specification<User> spec = Specification.where(null);

        if (search != null && !search.trim().isEmpty()) {
            String searchTerm = "%" + search.toLowerCase() + "%";
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.or(
                            criteriaBuilder.like(criteriaBuilder.lower(root.get("email")), searchTerm),
                            criteriaBuilder.like(criteriaBuilder.lower(root.get("firstName")), searchTerm),
                            criteriaBuilder.like(criteriaBuilder.lower(root.get("lastName")), searchTerm),
                            criteriaBuilder.like(criteriaBuilder.lower(root.get("phone")), searchTerm)
                    )
            );
        }

        Page<User> userPage = userRepository.findAll(spec, pageable);

        List<UserResponse> userResponses = userPage.getContent().stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());

        return PagedResponse.<UserResponse>builder()
                .content(userResponses)
                .page(userPage.getNumber())
                .size(userPage.getSize())
                .totalElements(userPage.getTotalElements())
                .totalPages(userPage.getTotalPages())
                .first(userPage.isFirst())
                .last(userPage.isLast())
                .hasNext(userPage.hasNext())
                .hasPrevious(userPage.hasPrevious())
                .build();
    }

    @Override
    public UserResponse updateUserStatus(Long userId, UpdateUserStatusRequest request) {
        log.info("Admin updating user status - ID: {}, active: {}", userId, request.getIsActive());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Boolean oldStatus = user.getIsActive();
        user.setIsActive(request.getIsActive());

        User savedUser = userRepository.save(user);

        log.info("User status updated successfully - ID: {}, active: {} -> {}",
                userId, oldStatus, request.getIsActive());

        return mapToUserResponse(savedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long userId) {
        log.info("Admin retrieving user details - ID: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return mapToUserResponse(user);
    }

    // User profile management methods

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getUserProfile(String userEmail) {
        log.info("Retrieving user profile for email: {}", userEmail);

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return mapToUserProfileResponse(user);
    }

    @Override
    public UserProfileResponse updateUserProfile(String userEmail, UpdateUserProfileRequest request) {
        log.info("Updating user profile for email: {}", userEmail);
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Update user fields
        // --- Update từng trường nếu có dữ liệu ---
        if (StringUtils.hasText(request.getFirstName())) {
            user.setFirstName(request.getFirstName());
        }
        if (StringUtils.hasText(request.getLastName())) {
            user.setLastName(request.getLastName());
        }
        if (StringUtils.hasText(request.getPhone())) {
            user.setPhone(request.getPhone());
        }

        Address address = user.getAddress() != null ? user.getAddress() : new Address();

        if (StringUtils.hasText(request.getStreet())) address.setStreet(request.getStreet());
        if (StringUtils.hasText(request.getCity())) address.setCity(request.getCity());
        if (StringUtils.hasText(request.getState())) address.setState(request.getState());
        if (StringUtils.hasText(request.getZipCode())) address.setZipCode(request.getZipCode());
        if (StringUtils.hasText(request.getCountry())) address.setCountry(request.getCountry());

        user.setAddress(address);

        User savedUser = userRepository.save(user);

        log.info("User profile updated successfully for email: {}", userEmail);

        return mapToUserProfileResponse(savedUser);
    }

    @Override
    public MessageResponse changePassword(String userEmail, ChangePasswordRequest request) {
        log.info("Changing password for user email: {}", userEmail);

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new ValidationException("Current password is incorrect");
        }

        // Verify new password confirmation
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new ValidationException("New password and confirmation do not match");
        }

        // Check if new password is different from current password
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new ValidationException("New password must be different from current password");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        log.info("Password changed successfully for user email: {}", userEmail);

        return MessageResponse.builder()
                .message("Password changed successfully")
                .build();
    }

    /**
     * Maps User entity to UserResponse DTO with statistics.
     */
    private UserResponse mapToUserResponse(User user) {
        // Get user order statistics
        Long totalOrders = orderRepository.countByUser(user);
        BigDecimal totalSpent = orderRepository.getTotalSpentByUser(user);
        LocalDateTime lastOrderDate = orderRepository.getLastOrderDateByUser(user);

        UserResponse.UserResponseBuilder builder = UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .totalOrders(totalOrders)
                .totalSpent(totalSpent != null ? totalSpent.doubleValue() : 0.0)
                .lastOrderDate(lastOrderDate);

        // Add address information if available
        if (user.getAddress() != null) {
            builder.street(user.getAddress().getStreet())
                    .city(user.getAddress().getCity())
                    .state(user.getAddress().getState())
                    .zipCode(user.getAddress().getZipCode())
                    .country(user.getAddress().getCountry());
        }

        return builder.build();
    }

    /**
     * Maps User entity to UserProfileResponse DTO.
     */
    private UserProfileResponse mapToUserProfileResponse(User user) {
        UserProfileResponse.UserProfileResponseBuilder builder = UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt());

        // Add address information if available
        if (user.getAddress() != null) {
            builder.street(user.getAddress().getStreet())
                    .city(user.getAddress().getCity())
                    .state(user.getAddress().getState())
                    .zipCode(user.getAddress().getZipCode())
                    .country(user.getAddress().getCountry());
        }

        return builder.build();
    }

    /**
     * Checks if the request contains address data.
     */
    private boolean hasAddressData(UpdateUserProfileRequest request) {
        return request.getStreet() != null && !request.getStreet().trim().isEmpty() &&
                request.getCity() != null && !request.getCity().trim().isEmpty() &&
                request.getState() != null && !request.getState().trim().isEmpty() &&
                request.getZipCode() != null && !request.getZipCode().trim().isEmpty() &&
                request.getCountry() != null && !request.getCountry().trim().isEmpty();
    }
}