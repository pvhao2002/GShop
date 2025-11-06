package com.ecommerce.service;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Service for tracking application metrics and business events.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MetricsService {

    private final MeterRegistry meterRegistry;

    // Predefined base metrics
    private final Counter userRegistrationCounter;
    private final Counter authenticationFailureCounter;
    private final Counter orderCreationCounter;
    private final Timer orderProcessingTimer;
    private final Counter productSearchCounter;
    private final Timer databaseQueryTimer;
    private final Counter apiErrorCounter;
    private final Counter securityEventCounter;

    /**
     * Record a successful user registration
     */
    public void recordUserRegistration() {
        userRegistrationCounter.increment();
        log.debug("User registration metric recorded");
    }

    /**
     * Record an authentication failure with reason
     */
    public void recordAuthenticationFailure(String reason) {
        Counter counter = Counter.builder("auth.failures")
                .tag("reason", reason)
                .register(meterRegistry);
        counter.increment();
        log.debug("Authentication failure recorded with reason: {}", reason);
    }

    /**
     * Record an order creation
     */
    public void recordOrderCreation() {
        orderCreationCounter.increment();
        log.debug("Order creation metric recorded");
    }

    /**
     * Record product search with tag
     */
    public void recordProductSearch(String searchType) {
        Counter counter = Counter.builder("product.searches")
                .tag("type", searchType)
                .register(meterRegistry);
        counter.increment();
        log.debug("Product search recorded for type: {}", searchType);
    }

    /**
     * Record an API error with dynamic tags
     */
    public void recordApiError(String errorType, int statusCode) {
        Counter counter = Counter.builder("api.errors")
                .tag("type", errorType)
                .tag("status", String.valueOf(statusCode))
                .register(meterRegistry);
        counter.increment();
        log.debug("API error recorded: {} ({})", errorType, statusCode);
    }

    /**
     * Record a security event
     */
    public void recordSecurityEvent(String eventType) {
        Counter counter = Counter.builder("security.events")
                .tag("type", eventType)
                .register(meterRegistry);
        counter.increment();
        log.debug("Security event recorded: {}", eventType);
    }

    /**
     * Time an arbitrary operation
     */
    public <T> T recordTimed(String operation, String tagKey, String tagValue, java.util.function.Supplier<T> supplier) {
        Timer timer = Timer.builder("operation.timer")
                .tag("operation", operation)
                .tag(tagKey, tagValue)
                .register(meterRegistry);

        return timer.record(supplier::get);
    }

    public void recordTimed(String operation, String tagKey, String tagValue, Runnable runnable) {
        Timer timer = Timer.builder("operation.timer")
                .tag("operation", operation)
                .tag(tagKey, tagValue)
                .register(meterRegistry);

        timer.record(runnable);
    }
}
