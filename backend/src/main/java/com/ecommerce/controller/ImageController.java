package com.ecommerce.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/images")
@Tag(name = "Image Management", description = "Static image serving for product photos and media content")
public class ImageController {
    
    @Value("${app.upload.dir:uploads/images}")
    private String uploadDir;
    
    @GetMapping("/{filename}")
    @Operation(
        summary = "Serve product image",
        description = """
            Serve a product image file by filename. Supports common image formats including JPEG, PNG, GIF, and WebP.
            
            **Supported Formats:** .jpg, .jpeg, .png, .gif, .webp
            **Usage:** This endpoint is typically used by frontend applications to display product images.
            
            **Example URLs:**
            - `/api/images/product-123.jpg`
            - `/api/images/category-banner.png`
            """,
        parameters = @io.swagger.v3.oas.annotations.Parameter(
            name = "filename",
            description = "Image filename with extension (e.g., 'product-123.jpg')",
            required = true,
            example = "product-123.jpg",
            schema = @Schema(type = "string", pattern = "^[a-zA-Z0-9._-]+\\.(jpg|jpeg|png|gif|webp)$")
        )
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Image served successfully",
            content = {
                @Content(mediaType = "image/jpeg", schema = @Schema(type = "string", format = "binary")),
                @Content(mediaType = "image/png", schema = @Schema(type = "string", format = "binary")),
                @Content(mediaType = "image/gif", schema = @Schema(type = "string", format = "binary")),
                @Content(mediaType = "image/webp", schema = @Schema(type = "string", format = "binary"))
            }
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "404",
            description = "Image not found",
            content = @Content()
        )
    })
    public ResponseEntity<Resource> getImage(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                // Determine content type
                String contentType = "image/jpeg"; // default
                if (filename.toLowerCase().endsWith(".png")) {
                    contentType = "image/png";
                } else if (filename.toLowerCase().endsWith(".gif")) {
                    contentType = "image/gif";
                } else if (filename.toLowerCase().endsWith(".webp")) {
                    contentType = "image/webp";
                }
                
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}