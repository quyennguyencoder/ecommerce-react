import type {
  ApiResponse,
  ProductVariantCreateRequest,
  ProductVariantResponse,
  ProductVariantUpdateRequest,
} from '../types';

import api from './api';

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
};
