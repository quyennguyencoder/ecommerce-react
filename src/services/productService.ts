import axios from 'axios';

import type {
  ApiResponse,
  PaginationResponse,
  ProductCreateRequest,
  ProductResponse,
  ProductUpdateRequest,
} from '../types';

const API_BASE_URL =
  (import.meta as { env: { VITE_API_BASE_URL?: string } }).env
    .VITE_API_BASE_URL ?? 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
});

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

  async getProductThumbnail(id: number) {
    const response = await api.get(`${PRODUCTS_PATH}/${id}/thumbnail`, {
      responseType: 'blob',
    });
    return response.data as Blob;
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
