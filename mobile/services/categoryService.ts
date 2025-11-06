import apiService from './apiService';
import { Category, ApiResponse } from '../types';

export interface CreateCategoryData {
    name: string;
    description?: string | undefined;
    parentId?: string | undefined;
}

export interface UpdateCategoryData {
    id: string;
    name: string;
    description?: string | undefined;
    parentId?: string | undefined;
}

class CategoryService {
    // Get all categories
    async getCategories(): Promise<Category[]> {
        const response = await apiService.get<ApiResponse<Category[]>>('/categories');
        return response.data;
    }

    // Get category by ID
    async getCategoryById(id: string): Promise<Category> {
        const response = await apiService.get<ApiResponse<Category>>(`/categories/${id}`);
        return response.data;
    }

    // Create new category
    async createCategory(categoryData: CreateCategoryData): Promise<Category> {
        const response = await apiService.post<ApiResponse<Category>>('/categories', categoryData);
        return response.data;
    }

    // Update existing category
    async updateCategory(categoryData: UpdateCategoryData): Promise<Category> {
        const { id, ...updateData } = categoryData;
        const response = await apiService.put<ApiResponse<Category>>(`/categories/${id}`, updateData);
        return response.data;
    }

    // Delete category
    async deleteCategory(id: string): Promise<void> {
        await apiService.delete<ApiResponse<void>>(`/categories/${id}`);
    }

    // Get category hierarchy (categories with their children)
    async getCategoryHierarchy(): Promise<Category[]> {
        const response = await apiService.get<ApiResponse<Category[]>>('/categories/hierarchy');
        return response.data;
    }

    // Get products by category
    async getProductsByCategory(categoryId: string): Promise<any[]> {
        const response = await apiService.get<ApiResponse<any[]>>(`/categories/${categoryId}/products`);
        return response.data;
    }

    // Assign products to category
    async assignProductsToCategory(categoryId: string, productIds: string[]): Promise<void> {
        await apiService.post<ApiResponse<void>>(`/categories/${categoryId}/products`, { productIds });
    }

    // Remove products from category
    async removeProductsFromCategory(categoryId: string, productIds: string[]): Promise<void> {
        await apiService.post<ApiResponse<void>>(`/categories/${categoryId}/products/remove`, { productIds });
    }
}

export default new CategoryService();