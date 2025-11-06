package com.ecommerce.dto.common;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.util.List;

/**
 * Enhanced paginated response DTO with comprehensive pagination metadata.
 * Provides detailed pagination information for mobile app consumption.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EnhancedPagedResponse<T> {
    
    private List<T> content;
    private PaginationMetadata pagination;
    
    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class PaginationMetadata {
        private int currentPage;
        private int pageSize;
        private long totalElements;
        private int totalPages;
        private boolean first;
        private boolean last;
        private boolean hasNext;
        private boolean hasPrevious;
        private int numberOfElements;
        private boolean empty;
        private SortMetadata sort;
    }
    
    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class SortMetadata {
        private boolean sorted;
        private String direction;
        private String property;
    }
    
    /**
     * Create paginated response from Spring Data Page
     */
    public static <T> EnhancedPagedResponse<T> from(Page<T> page) {
        PaginationMetadata.PaginationMetadataBuilder paginationBuilder = PaginationMetadata.builder()
                .currentPage(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .numberOfElements(page.getNumberOfElements())
                .empty(page.isEmpty());
        
        // Add sort information if present
        if (page.getSort().isSorted()) {
            page.getSort().forEach(order -> {
                paginationBuilder.sort(SortMetadata.builder()
                        .sorted(true)
                        .direction(order.getDirection().name())
                        .property(order.getProperty())
                        .build());
            });
        } else {
            paginationBuilder.sort(SortMetadata.builder()
                    .sorted(false)
                    .build());
        }
        
        return EnhancedPagedResponse.<T>builder()
                .content(page.getContent())
                .pagination(paginationBuilder.build())
                .build();
    }
    
    /**
     * Create paginated response with custom content and page info
     */
    public static <T> EnhancedPagedResponse<T> of(List<T> content, int page, int size, long totalElements) {
        int totalPages = (int) Math.ceil((double) totalElements / size);
        
        PaginationMetadata pagination = PaginationMetadata.builder()
                .currentPage(page)
                .pageSize(size)
                .totalElements(totalElements)
                .totalPages(totalPages)
                .first(page == 0)
                .last(page >= totalPages - 1)
                .hasNext(page < totalPages - 1)
                .hasPrevious(page > 0)
                .numberOfElements(content.size())
                .empty(content.isEmpty())
                .sort(SortMetadata.builder().sorted(false).build())
                .build();
        
        return EnhancedPagedResponse.<T>builder()
                .content(content)
                .pagination(pagination)
                .build();
    }
}