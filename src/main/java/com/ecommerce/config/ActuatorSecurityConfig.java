package com.ecommerce.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.actuate.autoconfigure.security.servlet.EndpointRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Security configuration for Spring Boot Actuator endpoints.
 * Protects management endpoints with appropriate access controls.
 */
@Configuration
@EnableWebSecurity
@Slf4j
@Order(1) // Higher priority than main security config
public class ActuatorSecurityConfig {

    /**
     * Configure security for actuator endpoints
     */
    @Bean
    public SecurityFilterChain actuatorSecurityFilterChain(HttpSecurity http) throws Exception {
        http.securityMatcher(EndpointRequest.toAnyEndpoint())
            .authorizeHttpRequests(auth -> auth
                // Health and info endpoints are public
                .requestMatchers(EndpointRequest.to("health", "info")).permitAll()
                // All other actuator endpoints require ADMIN role
                .requestMatchers(EndpointRequest.toAnyEndpoint()).hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .httpBasic(httpBasic -> {
                // Use HTTP Basic authentication for actuator endpoints
                log.info("HTTP Basic authentication configured for actuator endpoints");
            });

        log.info("Actuator security configuration applied");
        return http.build();
    }
}