import axios from 'axios';

import type {
  ApiResponse,
  CategoryCreateRequest,
  CategoryResponse,
  CategoryUpdateRequest,
} from '../types';

const API_BASE_URL =
  (import.meta as { env: { VITE_API_BASE_URL?: string } }).env
    .VITE_API_BASE_URL ?? 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
});

const CATEGORIES_PATH = '/api/v1/categories';

export const categoryService = {
  async getAllCategories() {
    const response = await api.get<ApiResponse<CategoryResponse[]>>(
      CATEGORIES_PATH
    );
    return response.data;
  },

  async getCategoryById(id: number) {
    const response = await api.get<ApiResponse<CategoryResponse>>(
      `${CATEGORIES_PATH}/${id}`
    );
    return response.data;
  },

  async createCategory(payload: CategoryCreateRequest) {
    const response = await api.post<ApiResponse<CategoryResponse>>(
      CATEGORIES_PATH,
      payload
    );
    return response.data;
  },

  async updateCategory(id: number, payload: CategoryUpdateRequest) {
    const response = await api.put<ApiResponse<CategoryResponse>>(
      `${CATEGORIES_PATH}/${id}`,
      payload
    );
    return response.data;
  },

  async deleteCategory(id: number) {
    const response = await api.delete<ApiResponse<void>>(
      `${CATEGORIES_PATH}/${id}`
    );
    return response.data;
  },
};
