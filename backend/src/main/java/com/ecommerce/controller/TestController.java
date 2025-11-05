package com.ecommerce.controller;

import com.ecommerce.security.SecurityUtils;
import com.ecommerce.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/test")
@Tag(name = "Test", description = "Test endpoints for authentication and authorization")
public class TestController {
    
    @GetMapping("/public")
    @Operation(summary = "Public endpoint", description = "Accessible without authentication")
    public ResponseEntity<Map<String, String>> publicEndpoint() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "This is a public endpoint");
        response.put("timestamp", String.valueOf(System.currentTimeMillis()));
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/user")
    @Operation(summary = "User endpoint", description = "Accessible by authenticated users")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Map<String, Object>> userEndpoint() {
        UserPrincipal currentUser = SecurityUtils.getCurrentUser();
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Hello authenticated user!");
        response.put("user", Map.of(
            "id", currentUser.getId(),
            "email", currentUser.getEmail(),
            "role", currentUser.getRole(),
            "fullName", currentUser.getFullName()
        ));
        response.put("timestamp", String.valueOf(System.currentTimeMillis()));
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/admin")
    @Operation(summary = "Admin endpoint", description = "Accessible only by admin users")
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> adminEndpoint() {
        UserPrincipal currentUser = SecurityUtils.getCurrentUser();
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Hello admin user!");
        response.put("admin", Map.of(
            "id", currentUser.getId(),
            "email", currentUser.getEmail(),
            "role", currentUser.getRole(),
            "fullName", currentUser.getFullName()
        ));
        response.put("timestamp", String.valueOf(System.currentTimeMillis()));
        
        return ResponseEntity.ok(response);
    }
}