package com.ecommerce.service;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Timer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Service for tracking application metrics and business events.
 * Provides methods to increment counters and record timers for monitoring.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MetricsService {

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
     * Record an authentication failure
     */
    public void recordAuthenticationFailure(String reason) {
        authenticationFailureCounter.increment("reason", reason);
        log.debug("Authentication failure metric recorded: {}", reason);
    }

    /**
     * Record a successful order creation
     */
    public void recordOrderCreation() {
        orderCreationCounter.increment();
        log.debug("Order creation metric recorded");
    }

    /**
     * Start timing order processing
     */
    public Timer.Sample startOrderProcessingTimer() {
        return Timer.start();
    }

    /**
     * Stop timing order processing
     */
    public void stopOrderProcessingTimer(Timer.Sample sample) {
        sample.stop(orderProcessingTimer);
        log.debug("Order processing time recorded");
    }

    /**
     * Record a product search
     */
    public void recordProductSearch(String searchType) {
        productSearchCounter.increment("type", searchType);
        log.debug("Product search metric recorded: {}", searchType);
    }

    /**
     * Start timing database query
     */
    public Timer.Sample startDatabaseQueryTimer() {
        return Timer.start();
    }

    /**
     * Stop timing database query
     */
    public void stopDatabaseQueryTimer(Timer.Sample sample, String queryType) {
        sample.stop(databaseQueryTimer.tag("type", queryType));
        log.debug("Database query time recorded: {}", queryType);
    }

    /**
     * Record an API error
     */
    public void recordApiError(String errorType, int statusCode) {
        apiErrorCounter.increment("type", errorType, "status", String.valueOf(statusCode));
        log.debug("API error metric recorded: {} ({})", errorType, statusCode);
    }

    /**
     * Record a security event
     */
    public void recordSecurityEvent(String eventType) {
        securityEventCounter.increment("type", eventType);
        log.debug("Security event metric recorded: {}", eventType);
    }

    /**
     * Record a timed operation
     */
    public <T> T recordTimed(String operation, Timer timer, java.util.function.Supplier<T> supplier) {
        Timer.Sample sample = Timer.start();
        try {
            T result = supplier.get();
            sample.stop(timer);
            log.debug("Timed operation completed: {}", operation);
            return result;
        } catch (Exception e) {
            sample.stop(timer.tag("status", "error"));
            log.debug("Timed operation failed: {}", operation);
            throw e;
        }
    }

    /**
     * Record a timed operation without return value
     */
    public void recordTimed(String operation, Timer timer, Runnable runnable) {
        Timer.Sample sample = Timer.start();
        try {
            runnable.run();
            sample.stop(timer);
            log.debug("Timed operation completed: {}", operation);
        } catch (Exception e) {
            sample.stop(timer.tag("status", "error"));
            log.debug("Timed operation failed: {}", operation);
            throw e;
        }
    }
}