package com.ecommerce.config;

import com.ecommerce.interceptor.ApiResponseInterceptor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

/**
 * Web MVC Configuration for API enhancements
 * Configures interceptors, message converters, and response formatting
 */
@Configuration
@RequiredArgsConstructor
@Slf4j
public class WebConfig implements WebMvcConfigurer {

    private final ApiResponseInterceptor apiResponseInterceptor;
    
    /**
     * Register API interceptors
     */
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(apiResponseInterceptor)
                .addPathPatterns("/api/**")
                .excludePathPatterns("/api/auth/login", "/api/auth/register"); // Exclude auth endpoints from some processing
        
        log.info("API response interceptor registered for /api/** paths");
    }
    
    /**
     * Configure HTTP message converters for response formatting
     */
    @Override
    public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
        // Ensure JSON converter is properly configured
        MappingJackson2HttpMessageConverter jsonConverter = new MappingJackson2HttpMessageConverter();
        
        // Configure Jackson for consistent JSON formatting
        jsonConverter.getObjectMapper()
                .findAndRegisterModules()
                .configure(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false)
                .configure(com.fasterxml.jackson.databind.SerializationFeature.INDENT_OUTPUT, false)
                .configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
                .setPropertyNamingStrategy(com.fasterxml.jackson.databind.PropertyNamingStrategies.LOWER_CAMEL_CASE);
        
        converters.add(0, jsonConverter);
        
        log.info("HTTP message converters configured for consistent JSON formatting");
    }
}