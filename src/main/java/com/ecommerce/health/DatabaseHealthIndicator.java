package com.ecommerce.health;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.actuator.health.Health;
import org.springframework.boot.actuator.health.HealthIndicator;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * Custom health indicator for database connectivity and performance.
 * Checks database connection, response time, and basic query execution.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseHealthIndicator implements HealthIndicator {

    private final DataSource dataSource;
    
    private static final String HEALTH_CHECK_QUERY = "SELECT 1";
    private static final long SLOW_QUERY_THRESHOLD_MS = 1000;

    @Override
    public Health health() {
        try {
            return checkDatabaseHealth();
        } catch (Exception e) {
            log.error("Database health check failed", e);
            return Health.down()
                    .withDetail("error", e.getMessage())
                    .withDetail("database", "MySQL")
                    .build();
        }
    }

    private Health checkDatabaseHealth() throws SQLException {
        long startTime = System.currentTimeMillis();
        
        try (Connection connection = dataSource.getConnection();
             PreparedStatement statement = connection.prepareStatement(HEALTH_CHECK_QUERY);
             ResultSet resultSet = statement.executeQuery()) {
            
            long responseTime = System.currentTimeMillis() - startTime;
            
            if (resultSet.next()) {
                Health.Builder healthBuilder = Health.up()
                        .withDetail("database", "MySQL")
                        .withDetail("responseTime", responseTime + "ms")
                        .withDetail("status", "Connected");
                
                // Check if query is slow
                if (responseTime > SLOW_QUERY_THRESHOLD_MS) {
                    log.warn("Database health check query took {}ms (threshold: {}ms)", 
                            responseTime, SLOW_QUERY_THRESHOLD_MS);
                    healthBuilder.withDetail("warning", "Slow database response");
                }
                
                // Add connection pool information if available
                try {
                    healthBuilder.withDetail("connectionPoolActive", getActiveConnections());
                    healthBuilder.withDetail("connectionPoolMax", getMaxConnections());
                } catch (Exception e) {
                    log.debug("Could not retrieve connection pool information: {}", e.getMessage());
                }
                
                return healthBuilder.build();
            } else {
                return Health.down()
                        .withDetail("database", "MySQL")
                        .withDetail("error", "Health check query returned no results")
                        .build();
            }
        }
    }

    private int getActiveConnections() {
        // This would depend on the connection pool implementation
        // For HikariCP (default in Spring Boot), you could access HikariDataSource
        try {
            if (dataSource instanceof com.zaxxer.hikari.HikariDataSource) {
                com.zaxxer.hikari.HikariDataSource hikariDataSource = 
                    (com.zaxxer.hikari.HikariDataSource) dataSource;
                return hikariDataSource.getHikariPoolMXBean().getActiveConnections();
            }
        } catch (Exception e) {
            log.debug("Could not get active connections: {}", e.getMessage());
        }
        return -1;
    }

    private int getMaxConnections() {
        try {
            if (dataSource instanceof com.zaxxer.hikari.HikariDataSource) {
                com.zaxxer.hikari.HikariDataSource hikariDataSource = 
                    (com.zaxxer.hikari.HikariDataSource) dataSource;
                return hikariDataSource.getHikariPoolMXBean().getMaximumPoolSize();
            }
        } catch (Exception e) {
            log.debug("Could not get max connections: {}", e.getMessage());
        }
        return -1;
    }
}