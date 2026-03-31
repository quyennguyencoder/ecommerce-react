import axios from 'axios';

import type {
  ApiResponse,
  ProductVariantCreateRequest,
  ProductVariantResponse,
  ProductVariantUpdateRequest,
} from '../types';

const API_BASE_URL =
  (import.meta as { env: { VITE_API_BASE_URL?: string } }).env
    .VITE_API_BASE_URL ?? 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
});

const PRODUCT_VARIANTS_PATH = '/api/v1/product-variants';

export const productVariantService = {
  async getProductVariantById(id: number) {
    const response = await api.get<ApiResponse<ProductVariantResponse>>(
      `${PRODUCT_VARIANTS_PATH}/${id}`
    );
    return response.data;
  },

  async getProductVariantsByProductId(productId: number) {
    const response = await api.get<ApiResponse<ProductVariantResponse[]>>(
      `${PRODUCT_VARIANTS_PATH}/product/${productId}`
    );
    return response.data;
  },

  async getProductVariantBySku(sku: string) {
    const response = await api.get<ApiResponse<ProductVariantResponse>>(
      `${PRODUCT_VARIANTS_PATH}/sku/${sku}`
    );
    return response.data;
  },

  async createProductVariant(payload: ProductVariantCreateRequest) {
    const response = await api.post<ApiResponse<ProductVariantResponse>>(
      PRODUCT_VARIANTS_PATH,
      payload
    );
    return response.data;
  },

  async updateProductVariant(id: number, payload: ProductVariantUpdateRequest) {
    const response = await api.put<ApiResponse<ProductVariantResponse>>(
      `${PRODUCT_VARIANTS_PATH}/${id}`,
      payload
    );
    return response.data;
  },

  async deleteProductVariant(id: number) {
    const response = await api.delete<ApiResponse<void>>(
      `${PRODUCT_VARIANTS_PATH}/${id}`
    );
    return response.data;
  },

  async uploadProductVariantImage(id: number, image: File) {
    const formData = new FormData();
    formData.append('image', image);

    const response = await api.put<ApiResponse<ProductVariantResponse>>(
      `${PRODUCT_VARIANTS_PATH}/${id}/image`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  async getProductVariantImage(id: number) {
    const response = await api.get(`${PRODUCT_VARIANTS_PATH}/${id}/image`, {
      responseType: 'blob',
    });
    return response.data as Blob;
  },
};
