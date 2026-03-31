import axios from 'axios';

import type {
  ApiResponse,
  OrderCreateRequest,
  OrderResponse,
  PaginationResponse,
} from '../types';
import type { OrderStatus } from '../types/enums';

const API_BASE_URL =
  (import.meta as { env: { VITE_API_BASE_URL?: string } }).env
    .VITE_API_BASE_URL ?? 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
});

const ORDERS_PATH = '/api/v1/orders';

export interface GetAllOrdersParams {
  status?: OrderStatus;
  page?: number;
  size?: number;
}

export interface GetMyOrdersParams {
  page?: number;
  size?: number;
}

export const orderService = {
  async getAllOrders(params?: GetAllOrdersParams) {
    const response = await api.get<ApiResponse<PaginationResponse<OrderResponse>>>(
      ORDERS_PATH,
      { params }
    );
    return response.data;
  },

  async getOrderById(id: number) {
    const response = await api.get<ApiResponse<OrderResponse>>(
      `${ORDERS_PATH}/${id}`
    );
    return response.data;
  },

  async getMyOrders(params?: GetMyOrdersParams) {
    const response = await api.get<ApiResponse<PaginationResponse<OrderResponse>>>(
      `${ORDERS_PATH}/my-orders`,
      { params }
    );
    return response.data;
  },

  async createOrder(payload: OrderCreateRequest) {
    const response = await api.post<ApiResponse<OrderResponse>>(
      ORDERS_PATH,
      payload
    );
    return response.data;
  },

  async updateOrderStatus(id: number, status: OrderStatus) {
    const response = await api.put<ApiResponse<OrderResponse>>(
      `${ORDERS_PATH}/${id}/status`,
      null,
      { params: { status } }
    );
    return response.data;
  },

  async deleteOrder(id: number) {
    const response = await api.delete<ApiResponse<void>>(`${ORDERS_PATH}/${id}`);
    return response.data;
  },
};
