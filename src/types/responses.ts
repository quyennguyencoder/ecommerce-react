import { Gender, OrderStatus, ShippingMethod, PaymentMethod, PaymentStatus, TransactionStatus, DiscountType } from './enums';

export interface AttributeResponse {
  id: number;
  name: string;
  attributeValueCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AttributeValueResponse {
  id: number;
  value: string;
  attributeId: number;
  attributeName: string;
  variantCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryResponse {
  id: number;
  name: string;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackResponse {
  id: number;
  star: number;
  content: string;
  productId: number;
  productName: string;
  userId: number;
  userName: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoleResponse {
  id: number;
  name: string;
}

export interface UserResponse {
  id: number;
  email: string;
  phone: string;
  name: string;
  dob: string;
  address: string;
  avatar: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  role: RoleResponse;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserResponse;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface AuthUrlResponse {
  authUrl: string;
}

export interface ProductImageResponse {
  id: number;
  imageUrl: string;
  productId: number;
  productName: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariantResponse {
  id: number;
  sku: string;
  price: number;
  stock: number;
  image: string;
  productId: number;
  productName: string;
  attributeValueIds: number[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductResponse {
  id: number;
  name: string;
  description: string;
  thumbnail: string;
  soldQuantity: number;
  rating: number;
  ratingCount: number;
  basePrice: number;
  isHot: boolean;
  totalStock: number;
  active: boolean;
  categoryId: number;
  categoryName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItemResponse {
  id: number;
  quantity: number;
  variantId: number;
  variantSku: string;
  productName: string;
  price: number;
  image: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartResponse {
  id: number;
  userId: number;
  cartItems: CartItemResponse[];
  totalItems: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderDetailResponse {
  id: number;
  price: number;
  quantity: number;
  orderId: number;
  variantId: number;
  variantSku: string;
  productName: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderResponse {
  id: number;
  name: string;
  gender: Gender;
  phone: string;
  email: string;
  shippingAddress: string;
  note: string;
  shippingMethod: ShippingMethod;
  shippingFee: number;
  total: number;
  status: OrderStatus;
  userId: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentUrl?: string;
  orderDetails: OrderDetailResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface PaymentUrlCreateResponse {
  paymentUrl: string;
}

export interface TransactionResponse {
  id: number;
  transactionId: string;
  paymentMethod: PaymentMethod;
  transactionStatus: TransactionStatus;
  orderId: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderCalculationResponse {
  subTotal: number;
  discountAmount: number;
  shippingFee: number;
  finalTotal: number;
  isCouponValid: boolean;
}

export interface CouponResponse {
  id: number;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue: number;
  maxDiscount: number;
  usageLimit: number;
  usedCount: number;
  startDate: string; // ISO DateTime string
  endDate: string; // ISO DateTime string
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
