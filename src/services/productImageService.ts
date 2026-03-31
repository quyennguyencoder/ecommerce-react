import axios from 'axios';

import type { ApiResponse, ProductImageResponse } from '../types';

const API_BASE_URL =
  (import.meta as { env: { VITE_API_BASE_URL?: string } }).env
    .VITE_API_BASE_URL ?? 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
});

const PRODUCT_IMAGES_PATH = '/api/v1/product-images';

export const productImageService = {
  async getProductImageById(id: number) {
    const response = await api.get<ApiResponse<ProductImageResponse>>(
      `${PRODUCT_IMAGES_PATH}/${id}`
    );
    return response.data;
  },

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

  async getProductImage(imageName: string) {
    const response = await api.get(`${PRODUCT_IMAGES_PATH}/image/${imageName}`,
      { responseType: 'blob' }
    );
    return response.data as Blob;
  },

  async deleteProductImage(id: number) {
    const response = await api.delete<ApiResponse<void>>(
      `${PRODUCT_IMAGES_PATH}/${id}`
    );
    return response.data;
  },
};
