package com.ecommerce.util;

import com.ecommerce.dto.admin.UserResponse;
import com.ecommerce.dto.order.OrderItemResponse;
import com.ecommerce.dto.order.OrderResponse;
import com.ecommerce.dto.product.CategoryResponse;
import com.ecommerce.dto.product.ProductResponse;
import com.ecommerce.dto.product.ProductVariantResponse;
import com.ecommerce.dto.user.UserProfileResponse;
import com.ecommerce.entity.*;
import lombok.experimental.UtilityClass;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Utility class for mapping between entities and DTOs.
 * Provides centralized mapping logic to maintain consistency.
 */
@UtilityClass
public class DtoMapper {

    /**
     * Map User entity to UserProfileResponse DTO
     */
    public static UserProfileResponse toUserProfileResponse(User user) {
        if (user == null) {
            return null;
        }
        
        return UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .address(user.getAddress())
                .createdAt(user.getCreatedAt())
                .build();
    }

    /**
     * Map User entity to UserResponse DTO (for admin)
     */
    public static UserResponse toUserResponse(User user) {
        if (user == null) {
            return null;
        }
        
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .build();
    }

    /**
     * Map Product entity to ProductResponse DTO
     */
    public static ProductResponse toProductResponse(Product product) {
        if (product == null) {
            return null;
        }
        
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .images(product.getImages())
                .category(toCategoryResponse(product.getCategory()))
                .isActive(product.getIsActive())
                .createdAt(product.getCreatedAt())
                .build();
    }

    /**
     * Map Category entity to CategoryResponse DTO
     */
    public static CategoryResponse toCategoryResponse(Category category) {
        if (category == null) {
            return null;
        }
        
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .build();
    }

    /**
     * Map ProductVariant entity to ProductVariantResponse DTO
     */
    public static ProductVariantResponse toProductVariantResponse(ProductVariant variant) {
        if (variant == null) {
            return null;
        }
        
        return ProductVariantResponse.builder()
                .id(variant.getId())
                .size(variant.getSize())
                .color(variant.getColor())
                .colorHex(variant.getColorHex())
                .quantity(variant.getQuantity())
                .additionalPrice(variant.getAdditionalPrice())
                .build();
    }

    /**
     * Map Order entity to OrderResponse DTO
     */
    public static OrderResponse toOrderResponse(Order order) {
        if (order == null) {
            return null;
        }
        
        return OrderResponse.builder()
                .id(order.getId())
                .userId(order.getUser().getId())
                .status(order.getStatus())
                .paymentMethod(order.getPaymentMethod())
                .subtotal(order.getSubtotal())
                .tax(order.getTax())
                .shipping(order.getShipping())
                .total(order.getTotal())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    /**
     * Map OrderItem entity to OrderItemResponse DTO
     */
    public static OrderItemResponse toOrderItemResponse(OrderItem orderItem) {
        if (orderItem == null) {
            return null;
        }
        
        return OrderItemResponse.builder()
                .id(orderItem.getId())
                .productId(orderItem.getProduct().getId())
                .productName(orderItem.getProduct().getName())
                .variantId(orderItem.getVariant() != null ? orderItem.getVariant().getId() : null)
                .variantDetails(toProductVariantResponse(orderItem.getVariant()))
                .quantity(orderItem.getQuantity())
                .unitPrice(orderItem.getUnitPrice())
                .totalPrice(orderItem.getTotalPrice())
                .build();
    }

    /**
     * Map list of entities to list of DTOs
     */
    public static <T, R> List<R> mapList(List<T> entities, java.util.function.Function<T, R> mapper) {
        if (entities == null) {
            return null;
        }
        
        return entities.stream()
                .map(mapper)
                .collect(Collectors.toList());
    }
}