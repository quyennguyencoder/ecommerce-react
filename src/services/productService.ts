import type {
  ApiResponse,
  PaginationResponse,
  ProductCreateRequest,
  ProductResponse,
  ProductUpdateRequest,
} from '../types';

import api from './api';

const PRODUCTS_PATH = '/api/v1/products';

export interface GetAllProductsParams {
  keyword?: string;
  categoryId?: number;
  active?: boolean;
  page?: number;
  size?: number;
}

export const productService = {
  async getAllProducts(params?: GetAllProductsParams) {
    const response = await api.get<ApiResponse<PaginationResponse<ProductResponse>>>(
      PRODUCTS_PATH,
      { params }
    );
    return response.data;
  },

  async getProductById(id: number) {
    const response = await api.get<ApiResponse<ProductResponse>>(
      `${PRODUCTS_PATH}/${id}`
    );
    return response.data;
  },

  async createProduct(payload: ProductCreateRequest) {
    const response = await api.post<ApiResponse<ProductResponse>>(
      PRODUCTS_PATH,
      payload
    );
    return response.data;
  },

  async updateProduct(id: number, payload: ProductUpdateRequest) {
    const response = await api.put<ApiResponse<ProductResponse>>(
      `${PRODUCTS_PATH}/${id}`,
      payload
    );
    return response.data;
  },

  async updateProductThumbnail(id: number, thumbnail: File) {
    const formData = new FormData();
    formData.append('thumbnail', thumbnail);

    const response = await api.put<ApiResponse<ProductResponse>>(
      `${PRODUCTS_PATH}/${id}/thumbnail`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  async deleteProduct(id: number) {
    const response = await api.delete<ApiResponse<void>>(`${PRODUCTS_PATH}/${id}`);
    return response.data;
  },

  async getHotProducts(page?: number, size?: number) {
    const response = await api.get<ApiResponse<PaginationResponse<ProductResponse>>>(
      `${PRODUCTS_PATH}/hot`,
      { params: { page, size } }
    );
    return response.data;
  },
};
