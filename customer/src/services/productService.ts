import api from './api';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  sizes: string[];
  colors: string[];
  stockQuantity: number;
  categoryId: string;
  category?: Category;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  parentId?: string;
  active: boolean;
  children?: Category[];
}

export interface ProductSearchParams {
  page?: number;
  size?: number;
  keyword?: string;
  categoryId?: string;
  sortBy?: 'name' | 'price' | 'createdAt';
  sortDirection?: 'asc' | 'desc';
}

export interface ProductListResponse {
  content: Product[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
}

class ProductService {
  async getProducts(params: ProductSearchParams = {}): Promise<ProductListResponse> {
    const response = await api.get('/products', { params });
    return response.data;
  }

  async getProductById(id: string): Promise<Product> {
    const response = await api.get(`/products/${id}`);
    return response.data;
  }

  async searchProducts(keyword: string, params: Omit<ProductSearchParams, 'keyword'> = {}): Promise<ProductListResponse> {
    const response = await api.get('/products/search', {
      params: { q: keyword, ...params }
    });
    return response.data;
  }

  async getProductsByCategory(categoryId: string, params: Omit<ProductSearchParams, 'categoryId'> = {}): Promise<ProductListResponse> {
    const response = await api.get(`/products/category/${categoryId}`, { params });
    return response.data;
  }

  async getCategories(): Promise<Category[]> {
    const response = await api.get('/categories');
    return response.data;
  }

  async getCategoryById(id: string): Promise<Category> {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  }

  async getRelatedProducts(productId: string, limit: number = 4): Promise<Product[]> {
    const response = await api.get(`/products/${productId}/related`, {
      params: { limit }
    });
    return response.data;
  }
}

export default new ProductService();