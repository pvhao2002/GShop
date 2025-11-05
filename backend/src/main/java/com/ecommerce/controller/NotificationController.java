package com.ecommerce.controller;

import com.ecommerce.dto.request.NotificationPreferencesRequest;
import com.ecommerce.dto.request.PushTokenRequest;
import com.ecommerce.entity.NotificationPreferences;
import com.ecommerce.entity.User;
import com.ecommerce.security.SecurityUtils;
import com.ecommerce.service.NotificationService;
import com.ecommerce.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Notifications", description = "Push notification management")
public class NotificationController {
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private UserService userService;
    
    @PostMapping("/push-token")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(summary = "Register push notification token", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Map<String, Object>> registerPushToken(@Valid @RequestBody PushTokenRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        User user = userService.findById(userId);
        
        notificationService.updatePushToken(user, request.getToken());
        userService.save(user);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Push token registered successfully");
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/preferences")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(summary = "Get notification preferences", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<NotificationPreferences> getNotificationPreferences() {
        Long userId = SecurityUtils.getCurrentUserId();
        User user = userService.findById(userId);
        
        NotificationPreferences preferences = notificationService.getOrCreateNotificationPreferences(user);
        
        return ResponseEntity.ok(preferences);
    }
    
    @PutMapping("/preferences")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(summary = "Update notification preferences", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<NotificationPreferences> updateNotificationPreferences(
            @Valid @RequestBody NotificationPreferencesRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        User user = userService.findById(userId);
        
        NotificationPreferences preferences = notificationService.updateNotificationPreferences(
                user,
                request.getOrderUpdates(),
                request.getPromotions(),
                request.getDeliveryNotifications(),
                request.getPaymentNotifications()
        );
        
        return ResponseEntity.ok(preferences);
    }
    
    @DeleteMapping("/push-token")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    @Operation(summary = "Remove push notification token", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Map<String, Object>> removePushToken() {
        Long userId = SecurityUtils.getCurrentUserId();
        User user = userService.findById(userId);
        
        notificationService.updatePushToken(user, null);
        userService.save(user);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Push token removed successfully");
        
        return ResponseEntity.ok(response);
    }
}