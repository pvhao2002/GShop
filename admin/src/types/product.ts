export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  images: string[];
  sizes: string[];
  colors: string[];
  category: Category;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  parentId?: number;
  active: boolean;
  children?: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductCreateRequest {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  images: string[];
  sizes: string[];
  colors: string[];
  categoryId: number;
  active: boolean;
}

export interface ProductUpdateRequest extends Partial<ProductCreateRequest> {
  id: number;
}

export interface CategoryCreateRequest {
  name: string;
  description: string;
  parentId?: number;
  active: boolean;
}

export interface CategoryUpdateRequest extends Partial<CategoryCreateRequest> {
  id: number;
}

export interface ProductSearchParams {
  page?: number;
  size?: number;
  search?: string;
  categoryId?: number;
  active?: boolean;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface ProductResponse {
  content: Product[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}