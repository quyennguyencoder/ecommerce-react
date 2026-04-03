import type { ApiResponse, ProductImageResponse } from '../types';

import api from './api';

const PRODUCT_IMAGES_PATH = '/api/v1/product-images';
export const productImageService = {
  async getProductImagesByProductId(productId: number) {
    const response = await api.get<ApiResponse<ProductImageResponse[]>>(
      `${PRODUCT_IMAGES_PATH}/product/${productId}`
    );
    return response.data;
  },

  async createProductImages(productId: number, images: File[]) {
    const formData = new FormData();
    images.forEach((image) => formData.append('images', image));

    const response = await api.post<ApiResponse<ProductImageResponse[]>>(
      `${PRODUCT_IMAGES_PATH}/product/${productId}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  async updateProductImage(id: number, image: File) {
    const formData = new FormData();
    formData.append('image', image);

    const response = await api.put<ApiResponse<ProductImageResponse>>(
      `${PRODUCT_IMAGES_PATH}/${id}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  async deleteProductImage(id: number) {
    const response = await api.delete<ApiResponse<void>>(
      `${PRODUCT_IMAGES_PATH}/${id}`
    );
    return response.data;
  },
};
