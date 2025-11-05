import apiService from './apiService';
import {
  Product,
  Category,
  ProductCreateRequest,
  ProductUpdateRequest,
  CategoryCreateRequest,
  CategoryUpdateRequest,
  ProductSearchParams,
  ProductResponse,
} from '../types/product';

export class ProductService {
  // Product CRUD operations
  static async getProducts(params: ProductSearchParams = {}): Promise<ProductResponse> {
    const response = await apiService.get('/products', { params });
    return response.data;
  }

  static async getProduct(id: number): Promise<Product> {
    const response = await apiService.get(`/products/${id}`);
    return response.data;
  }

  static async createProduct(product: ProductCreateRequest): Promise<Product> {
    const response = await apiService.post('/products', product);
    return response.data;
  }

  static async updateProduct(product: ProductUpdateRequest): Promise<Product> {
    const response = await apiService.put(`/products/${product.id}`, product);
    return response.data;
  }

  static async deleteProduct(id: number): Promise<void> {
    await apiService.delete(`/products/${id}`);
  }

  static async bulkUpdateProducts(productIds: number[], updates: Partial<ProductCreateRequest>): Promise<void> {
    await apiService.patch('/products/bulk', { productIds, updates });
  }

  static async bulkDeleteProducts(productIds: number[]): Promise<void> {
    await apiService.delete('/products/bulk', { data: { productIds } });
  }

  // Category CRUD operations
  static async getCategories(): Promise<Category[]> {
    const response = await apiService.get('/categories');
    return response.data;
  }

  static async getCategory(id: number): Promise<Category> {
    const response = await apiService.get(`/categories/${id}`);
    return response.data;
  }

  static async createCategory(category: CategoryCreateRequest): Promise<Category> {
    const response = await apiService.post('/categories', category);
    return response.data;
  }

  static async updateCategory(category: CategoryUpdateRequest): Promise<Category> {
    const response = await apiService.put(`/categories/${category.id}`, category);
    return response.data;
  }

  static async deleteCategory(id: number): Promise<void> {
    await apiService.delete(`/categories/${id}`);
  }

  // Image upload
  static async uploadImage(imageUri: string): Promise<string> {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'product-image.jpg',
    } as any);

    const response = await apiService.post('/products/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.imageUrl;
  }

  // Search and filtering
  static async searchProducts(query: string, params: ProductSearchParams = {}): Promise<ProductResponse> {
    const searchParams = { ...params, search: query };
    return this.getProducts(searchParams);
  }

  static async getProductsByCategory(categoryId: number, params: ProductSearchParams = {}): Promise<ProductResponse> {
    const searchParams = { ...params, categoryId };
    return this.getProducts(searchParams);
  }
}