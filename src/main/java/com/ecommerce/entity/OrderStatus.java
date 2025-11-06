package com.ecommerce.entity;

/**
 * Enum representing the status of an order in the system.
 * Tracks the order lifecycle from creation to completion.
 */
public enum OrderStatus {
    PENDING,
    PROCESSING,
    SHIPPED,
    DELIVERED,
    CANCELLED
}