package com.ecommerce.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * JPA configuration class for repository and transaction management optimization.
 * Provides custom repository configurations and performance enhancements.
 */
@Configuration
@EnableJpaRepositories(
    basePackages = "com.ecommerce.repository",
    enableDefaultTransactions = true
)
@EnableTransactionManagement
@Slf4j
public class JpaConfig {
    
    /**
     * Constructor to log JPA configuration initialization.
     */
    public JpaConfig() {
        log.info("Initializing JPA configuration with optimized settings");
    }
}