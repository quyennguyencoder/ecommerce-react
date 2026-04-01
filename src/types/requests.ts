import { Gender, ShippingMethod, PaymentMethod } from './enums';

export interface AuthLoginRequest {
  username: string;
  password: string;
}

export interface AuthRefreshTokenRequest {
  refreshToken: string;
}

export interface UserRegisterByEmailRequest {
  email: string;
  password: string;
  name: string;
  gender?: Gender;
  address?: string;
  dob?: string;
}

export interface UserRegisterByPhoneRequest {
  phone?: string;
  password: string;
  name: string;
  gender?: Gender;
  address?: string;
  dob?: string;
}

export interface UserChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserUpdateRequest {
  email?: string;
  phone?: string;
  name: string;
  address?: string;
  gender?: Gender;
  dob?: string;
}

export interface AttributeCreateRequest {
  name: string;
}

export interface AttributeUpdateRequest {
  name?: string;
}

export interface AttributeValueCreateRequest {
  value: string;
  attributeId: number;
}

export interface AttributeValueUpdateRequest {
  value?: string;
  attributeId?: number;
}

export interface CategoryCreateRequest {
  name: string;
}

export interface CategoryUpdateRequest {
  name?: string;
}

export interface FeedbackCreateRequest {
  star: number;
  content?: string;
  productId: number;
}

export interface RoleCreateRequest {
  name: string;
}

export interface CartAddToCartRequest {
  variantId: number;
  quantity: number;
}

export interface CartItemUpdateRequest {
  quantity: number;
}

export interface OrderCreateRequest {
  name: string;
  phone: string;
  email?: string;
  gender?: Gender;
  shippingAddress: string;
  note?: string;
  shippingMethod?: ShippingMethod;
  shippingFee?: number;
  total: number;
  couponCode?: string;
  cartItemIds: number[];
  paymentMethod: PaymentMethod;
}

export interface ProductCreateRequest {
  name: string;
  description?: string;
  basePrice?: number;
  isHot?: boolean;
  active?: boolean;
  categoryId: number;
}

export interface ProductUpdateRequest {
  name?: string;
  description?: string;
  basePrice?: number;
  totalStock?: number;
  isHot?: boolean;
  active?: boolean;
  categoryId?: number;
}

export interface ProductVariantCreateRequest {
  sku: string;
  price: number;
  stock: number;
  productId: number;
  attributeValueIds?: number[];
}

export interface ProductVariantUpdateRequest {
  sku?: string;
  price?: number;
  stock?: number;
  productId?: number;
  attributeValueIds?: number[];
}
