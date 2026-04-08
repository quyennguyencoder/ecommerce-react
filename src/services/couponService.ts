import type {
  ApiResponse,
  CouponCreateRequest,
  CouponResponse,
  CouponUpdateRequest,
} from '../types';

import api from './api';

const COUPONS_PATH = '/api/v1/coupons';

export const couponService = {
  async getAllCoupons() {
    const response = await api.get<ApiResponse<CouponResponse[]>>(
      COUPONS_PATH
    );
    return response.data;
  },

  async getCouponById(id: number) {
    const response = await api.get<ApiResponse<CouponResponse>>(
      `${COUPONS_PATH}/${id}`
    );
    return response.data;
  },

  async createCoupon(payload: CouponCreateRequest) {
    const response = await api.post<ApiResponse<CouponResponse>>(
      COUPONS_PATH,
      payload
    );
    return response.data;
  },

  async updateCoupon(id: number, payload: CouponUpdateRequest) {
    const response = await api.put<ApiResponse<CouponResponse>>(
      `${COUPONS_PATH}/${id}`,
      payload
    );
    return response.data;
  },

  async updateCouponActive(id: number, active: boolean) {
    const response = await api.patch<ApiResponse<CouponResponse>>(
      `${COUPONS_PATH}/${id}/active`,
      null,
      { params: { active } }
    );
    return response.data;
  },

  async deleteCoupon(id: number) {
    const response = await api.delete<ApiResponse<void>>(
      `${COUPONS_PATH}/${id}`
    );
    return response.data;
  },
};
