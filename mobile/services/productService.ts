import { Product, Category } from '../types';
import apiService from './apiService';

interface ProductSearchParams {
    query?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
    sortBy?: 'name' | 'price' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
}

interface ProductListResponse {
    products: Product[];
    total: number;
    page: number;
    totalPages: number;
}

class ProductService {
    /**
     * Get all products with optional filtering and pagination
     */
    async getProducts(params?: ProductSearchParams): Promise<ProductListResponse> {
        return apiService.get<ProductListResponse>('/products', params);
    }

    /**
     * Get a single product by ID
     */
    async getProductById(id: string): Promise<Product> {
        return apiService.get<Product>(`/products/${id}`);
    }

    /**
     * Search products by name or description
     */
    async searchProducts(query: string, params?: Omit<ProductSearchParams, 'query'>): Promise<ProductListResponse> {
        return apiService.get<ProductListResponse>('/products/search', {
            query,
            ...params
        });
    }

    /**
     * Get products by category
     */
    async getProductsByCategory(categoryId: string, params?: Omit<ProductSearchParams, 'categoryId'>): Promise<ProductListResponse> {
        return apiService.get<ProductListResponse>(`/products/category/${categoryId}`, params);
    }

    /**
     * Get all categories
     */
    async getCategories(): Promise<Category[]> {
        return apiService.get<Category[]>('/categories');
    }

    /**
     * Get category by ID
     */
    async getCategoryById(id: string): Promise<Category> {
        return apiService.get<Category>(`/categories/${id}`);
    }

    /**
     * Get featured/trending products
     */
    async getFeaturedProducts(limit: number = 10): Promise<Product[]> {
        return apiService.get<Product[]>('/products/featured', { limit });
    }

    /**
     * Get related products based on category or tags
     */
    async getRelatedProducts(productId: string, limit: number = 5): Promise<Product[]> {
        return apiService.get<Product[]>(`/products/${productId}/related`, { limit });
    }
}

export default new ProductService();