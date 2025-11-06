package com.ecommerce.config;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration for application metrics and monitoring.
 * Sets up custom metrics for business operations and performance monitoring.
 */
@Configuration
@Slf4j
public class MetricsConfig {

    /**
     * Counter for successful user registrations
     */
    @Bean
    public Counter userRegistrationCounter(MeterRegistry meterRegistry) {
        return Counter.builder("ecommerce.user.registrations")
                .description("Number of successful user registrations")
                .tag("type", "success")
                .register(meterRegistry);
    }

    /**
     * Counter for failed authentication attempts
     */
    @Bean
    public Counter authenticationFailureCounter(MeterRegistry meterRegistry) {
        return Counter.builder("ecommerce.auth.failures")
                .description("Number of failed authentication attempts")
                .tag("type", "failure")
                .register(meterRegistry);
    }

    /**
     * Counter for successful orders
     */
    @Bean
    public Counter orderCreationCounter(MeterRegistry meterRegistry) {
        return Counter.builder("ecommerce.orders.created")
                .description("Number of orders created")
                .tag("type", "success")
                .register(meterRegistry);
    }

    /**
     * Timer for order processing duration
     */
    @Bean
    public Timer orderProcessingTimer(MeterRegistry meterRegistry) {
        return Timer.builder("ecommerce.orders.processing.time")
                .description("Time taken to process orders")
                .register(meterRegistry);
    }

    /**
     * Counter for product searches
     */
    @Bean
    public Counter productSearchCounter(MeterRegistry meterRegistry) {
        return Counter.builder("ecommerce.products.searches")
                .description("Number of product searches performed")
                .register(meterRegistry);
    }

    /**
     * Timer for database query execution time
     */
    @Bean
    public Timer databaseQueryTimer(MeterRegistry meterRegistry) {
        return Timer.builder("ecommerce.database.query.time")
                .description("Time taken for database queries")
                .register(meterRegistry);
    }

    /**
     * Counter for API errors
     */
    @Bean
    public Counter apiErrorCounter(MeterRegistry meterRegistry) {
        return Counter.builder("ecommerce.api.errors")
                .description("Number of API errors")
                .register(meterRegistry);
    }

    /**
     * Counter for security events
     */
    @Bean
    public Counter securityEventCounter(MeterRegistry meterRegistry) {
        return Counter.builder("ecommerce.security.events")
                .description("Number of security events")
                .register(meterRegistry);
    }
}