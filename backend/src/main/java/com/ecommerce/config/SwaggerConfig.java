package com.ecommerce.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.media.Content;
import io.swagger.v3.oas.models.media.MediaType;
import io.swagger.v3.oas.models.media.Schema;
import io.swagger.v3.oas.models.responses.ApiResponse;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {
    
    @Value("${server.port:8080}")
    private String serverPort;
    
    @Value("${server.servlet.context-path:/api}")
    private String contextPath;
    
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("E-commerce Backend API")
                .description("""
                    ## Overview
                    REST API for a comprehensive e-commerce platform supporting:
                    - User authentication and authorization with JWT
                    - Product catalog management with categories and variants
                    - Shopping cart and order processing
                    - Multiple payment methods (COD, MoMo, VNPay)
                    - Admin dashboard with analytics and statistics
                    - Image upload and management
                    
                    ## Authentication
                    This API uses JWT (JSON Web Token) for authentication. Include the token in the Authorization header:
                    ```
                    Authorization: Bearer <your-jwt-token>
                    ```
                    
                    ## Error Handling
                    All endpoints return standardized error responses with appropriate HTTP status codes.
                    Error responses include error codes, messages, and additional details when applicable.
                    
                    ## Pagination
                    List endpoints support pagination with the following parameters:
                    - `page`: Page number (0-based, default: 0)
                    - `size`: Page size (default: 10)
                    - `sortBy`: Sort field (default varies by endpoint)
                    - `sortDir`: Sort direction (asc/desc, default varies by endpoint)
                    """)
                .version("1.0.0")
                .contact(new Contact()
                    .name("E-commerce Development Team")
                    .email("support@ecommerce.com")
                    .url("https://github.com/ecommerce-team"))
                .license(new License()
                    .name("MIT License")
                    .url("https://opensource.org/licenses/MIT")))
            .servers(List.of(
                new Server()
                    .url("http://localhost:" + serverPort + contextPath)
                    .description("Development Server"),
                new Server()
                    .url("https://api.ecommerce.com" + contextPath)
                    .description("Production Server")
            ))
            .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
            .components(new Components()
                .addSecuritySchemes("bearerAuth", new SecurityScheme()
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")
                    .description("JWT token for API authentication. Obtain token from /auth/login endpoint."))
                
                // Common response schemas
                .addResponses("UnauthorizedError", new ApiResponse()
                    .description("Authentication required - Invalid or missing JWT token")
                    .content(new Content()
                        .addMediaType("application/json", new MediaType()
                            .schema(new Schema<>()
                                .type("object")
                                .addProperty("error", new Schema<>()
                                    .type("object")
                                    .addProperty("code", new Schema<>().type("string").example("AUTHENTICATION_ERROR"))
                                    .addProperty("message", new Schema<>().type("string").example("JWT token is missing or invalid"))
                                    .addProperty("timestamp", new Schema<>().type("string").format("date-time")))))))
                
                .addResponses("ForbiddenError", new ApiResponse()
                    .description("Access denied - Insufficient privileges")
                    .content(new Content()
                        .addMediaType("application/json", new MediaType()
                            .schema(new Schema<>()
                                .type("object")
                                .addProperty("error", new Schema<>()
                                    .type("object")
                                    .addProperty("code", new Schema<>().type("string").example("ACCESS_DENIED"))
                                    .addProperty("message", new Schema<>().type("string").example("Access denied. Insufficient privileges."))
                                    .addProperty("timestamp", new Schema<>().type("string").format("date-time")))))))
                
                .addResponses("NotFoundError", new ApiResponse()
                    .description("Resource not found")
                    .content(new Content()
                        .addMediaType("application/json", new MediaType()
                            .schema(new Schema<>()
                                .type("object")
                                .addProperty("error", new Schema<>()
                                    .type("object")
                                    .addProperty("code", new Schema<>().type("string").example("RESOURCE_NOT_FOUND"))
                                    .addProperty("message", new Schema<>().type("string").example("The requested resource was not found"))
                                    .addProperty("timestamp", new Schema<>().type("string").format("date-time")))))))
                
                .addResponses("ValidationError", new ApiResponse()
                    .description("Validation error - Invalid input data")
                    .content(new Content()
                        .addMediaType("application/json", new MediaType()
                            .schema(new Schema<>()
                                .type("object")
                                .addProperty("error", new Schema<>()
                                    .type("object")
                                    .addProperty("code", new Schema<>().type("string").example("VALIDATION_ERROR"))
                                    .addProperty("message", new Schema<>().type("string").example("Invalid input data"))
                                    .addProperty("details", new Schema<>()
                                        .type("object")
                                        .additionalProperties(new Schema<>().type("string"))
                                        .example(java.util.Map.of("email", "Email format is invalid", "password", "Password must be at least 8 characters")))
                                    .addProperty("timestamp", new Schema<>().type("string").format("date-time")))))))
                
                .addResponses("InternalServerError", new ApiResponse()
                    .description("Internal server error")
                    .content(new Content()
                        .addMediaType("application/json", new MediaType()
                            .schema(new Schema<>()
                                .type("object")
                                .addProperty("error", new Schema<>()
                                    .type("object")
                                    .addProperty("code", new Schema<>().type("string").example("INTERNAL_ERROR"))
                                    .addProperty("message", new Schema<>().type("string").example("An internal error occurred"))
                                    .addProperty("timestamp", new Schema<>().type("string").format("date-time")))))))
            );
    }
}