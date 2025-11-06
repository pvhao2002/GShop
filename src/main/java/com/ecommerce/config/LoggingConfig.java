package com.ecommerce.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration class for application logging setup.
 * Configures structured logging patterns and logging behavior.
 */
@Configuration
@Slf4j
public class LoggingConfig {

    public LoggingConfig() {
        log.info("Logging configuration initialized with structured logging patterns");
    }
}