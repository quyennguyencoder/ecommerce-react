import axios from 'axios';

import type {
  ApiResponse,
  CartAddToCartRequest,
  CartItemUpdateRequest,
  CartResponse,
} from '../types';

const API_BASE_URL =
  (import.meta as { env: { VITE_API_BASE_URL?: string } }).env
    .VITE_API_BASE_URL ?? 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
});

const CARTS_PATH = '/api/v1/carts';

export const cartService = {
  async getMyCart() {
    const response = await api.get<ApiResponse<CartResponse>>(CARTS_PATH);
    return response.data;
  },

  async addToCart(payload: CartAddToCartRequest) {
    const response = await api.post<ApiResponse<CartResponse>>(
      `${CARTS_PATH}/items`,
      payload
    );
    return response.data;
  },

  async updateCartItem(cartItemId: number, payload: CartItemUpdateRequest) {
    const response = await api.put<ApiResponse<CartResponse>>(
      `${CARTS_PATH}/items/${cartItemId}`,
      payload
    );
    return response.data;
  },

  async removeFromCart(cartItemId: number) {
    const response = await api.delete<ApiResponse<CartResponse>>(
      `${CARTS_PATH}/items/${cartItemId}`
    );
    return response.data;
  },

  async clearCart() {
    const response = await api.delete<ApiResponse<void>>(CARTS_PATH);
    return response.data;
  },
};
