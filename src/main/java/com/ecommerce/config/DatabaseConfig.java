package com.ecommerce.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.sql.DataSource;

/**
 * Database configuration class for optimizing connection pooling and transaction management.
 * Provides environment-specific database configurations and performance optimizations.
 */
@Configuration
@EnableTransactionManagement
@Slf4j
public class DatabaseConfig {
    
    @Value("${spring.datasource.url}")
    private String jdbcUrl;
    
    @Value("${spring.datasource.username}")
    private String username;
    
    @Value("${spring.datasource.password}")
    private String password;
    
    @Value("${spring.datasource.driver-class-name}")
    private String driverClassName;
    
    /**
     * Production DataSource configuration with optimized HikariCP settings.
     * Used in production environment for maximum performance.
     */
    @Bean
    @Profile("prod")
    public DataSource productionDataSource() {
        log.info("Configuring production DataSource with optimized settings");
        
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(jdbcUrl);
        config.setUsername(username);
        config.setPassword(password);
        config.setDriverClassName(driverClassName);
        
        // Production-optimized connection pool settings
        config.setMaximumPoolSize(30);
        config.setMinimumIdle(10);
        config.setIdleTimeout(600000); // 10 minutes
        config.setMaxLifetime(1800000); // 30 minutes
        config.setConnectionTimeout(30000); // 30 seconds
        config.setValidationTimeout(5000); // 5 seconds
        config.setLeakDetectionThreshold(60000); // 1 minute
        
        // Connection pool name for monitoring
        config.setPoolName("EcommerceProdHikariCP");
        
        // Performance optimizations
        config.addDataSourceProperty("cachePrepStmts", "true");
        config.addDataSourceProperty("prepStmtCacheSize", "250");
        config.addDataSourceProperty("prepStmtCacheSqlLimit", "2048");
        config.addDataSourceProperty("useServerPrepStmts", "true");
        config.addDataSourceProperty("useLocalSessionState", "true");
        config.addDataSourceProperty("rewriteBatchedStatements", "true");
        config.addDataSourceProperty("cacheResultSetMetadata", "true");
        config.addDataSourceProperty("cacheServerConfiguration", "true");
        config.addDataSourceProperty("elideSetAutoCommits", "true");
        config.addDataSourceProperty("maintainTimeStats", "false");
        
        // Connection validation
        config.setConnectionTestQuery("SELECT 1");
        
        return new HikariDataSource(config);
    }
    
    /**
     * Development DataSource configuration with debugging features.
     * Used in development environment for easier debugging.
     */
    @Bean
    @Profile("dev")
    public DataSource developmentDataSource() {
        log.info("Configuring development DataSource with debugging features");
        
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(jdbcUrl);
        config.setUsername(username);
        config.setPassword(password);
        config.setDriverClassName(driverClassName);
        
        // Development connection pool settings (smaller pool)
        config.setMaximumPoolSize(10);
        config.setMinimumIdle(2);
        config.setIdleTimeout(300000); // 5 minutes
        config.setMaxLifetime(1200000); // 20 minutes
        config.setConnectionTimeout(20000); // 20 seconds
        config.setValidationTimeout(3000); // 3 seconds
        config.setLeakDetectionThreshold(60000); // 1 minute
        
        // Connection pool name for monitoring
        config.setPoolName("EcommerceDevHikariCP");
        
        // Development optimizations (less aggressive)
        config.addDataSourceProperty("cachePrepStmts", "true");
        config.addDataSourceProperty("prepStmtCacheSize", "100");
        config.addDataSourceProperty("prepStmtCacheSqlLimit", "1024");
        config.addDataSourceProperty("useServerPrepStmts", "true");
        
        // Connection validation
        config.setConnectionTestQuery("SELECT 1");
        
        return new HikariDataSource(config);
    }
    
    /**
     * Custom transaction manager with optimized settings.
     * Provides better transaction handling and performance monitoring.
     */
    @Bean
    public PlatformTransactionManager transactionManager() {
        log.info("Configuring optimized JPA transaction manager");
        
        JpaTransactionManager transactionManager = new JpaTransactionManager();
        
        // Transaction timeout settings
        transactionManager.setDefaultTimeout(30); // 30 seconds default timeout
        transactionManager.setRollbackOnCommitFailure(true);
        
        return transactionManager;
    }
}