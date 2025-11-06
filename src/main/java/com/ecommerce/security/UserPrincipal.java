package com.ecommerce.security;

import com.ecommerce.entity.Role;
import com.ecommerce.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

/**
 * UserPrincipal class implementing UserDetails interface for Spring Security
 * Wraps the User entity and provides security-related information
 */
@Data
@AllArgsConstructor
public class UserPrincipal implements UserDetails {

    private Long id;
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private Role role;
    private Boolean isActive;

    /**
     * Create UserPrincipal from User entity
     */
    public static UserPrincipal create(User user) {
        return new UserPrincipal(
            user.getId(),
            user.getEmail(),
            user.getPassword(),
            user.getFirstName(),
            user.getLastName(),
            user.getRole(),
            user.getIsActive()
        );
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Map role to Spring Security authority with ROLE_ prefix
        String authority = "ROLE_" + role.name();
        return Collections.singletonList(new SimpleGrantedAuthority(authority));
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        // Use email as username for authentication
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return isActive;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return isActive;
    }

    /**
     * Get full name of the user
     */
    public String getFullName() {
        return firstName + " " + lastName;
    }

    /**
     * Check if user has admin role
     */
    public boolean isAdmin() {
        return Role.ADMIN.equals(role);
    }

    /**
     * Check if user has user role
     */
    public boolean isUser() {
        return Role.USER.equals(role);
    }
}