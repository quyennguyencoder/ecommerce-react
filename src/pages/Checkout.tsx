import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useLocation } from 'react-router-dom';

import CheckoutForm from '../components/checkout/CheckoutForm';
import ShippingMethods from '../components/checkout/ShippingMethods';
import PaymentMethods from '../components/checkout/PaymentMethods';
import OrderSummary from '../components/checkout/OrderSummary';
import { ShippingMethod, PaymentMethod, Gender } from '../types/enums';
import { cartService } from '../services/cartService';
import { orderService } from '../services/orderService';
import { paymentService } from '../services/paymentService';
import type { CartResponse } from '../types';

const checkoutSchema = z.object({
  name: z.string().min(2, 'Tên người nhận phải có ít nhất 2 ký tự').max(50),
  gender: z.nativeEnum(Gender).optional().or(z.literal('')),
  phone: z.string().regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, 'Số điện thoại không hợp lệ'),
  email: z.string().email('Email không đúng định dạng'),
  address: z.string().min(10, 'Địa chỉ cần chi tiết hơn (ít nhất 10 ký tự)'),
  note: z.string().optional(),
  couponCode: z.string().optional(),
  shippingMethod: z.nativeEnum(ShippingMethod),
  paymentMethod: z.nativeEnum(PaymentMethod),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const Checkout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingCart, setIsFetchingCart] = useState(true);
  const [cartData, setCartData] = useState<CartResponse | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state;
  
  useEffect(() => {
    const loadCart = async () => {
      setIsFetchingCart(true);
      try {
        if (state?.isBuyNow && state?.buyNowItem) {
          const item = state.buyNowItem;
          // Build fake cart data for Buy Now
          const fakeCartItem = {
            id: -1,
            quantity: item.quantity,
            variantId: item.variant.id,
            variantSku: item.variant.sku,
            productName: item.product.name,
            price: item.variant.price,
            image: item.variant.image || item.product.thumbnail,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          setCartData({
            id: -1,
            userId: -1,
            cartItems: [fakeCartItem],
            totalItems: item.quantity,
            totalPrice: item.variant.price * item.quantity,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        } else {
          const res = await cartService.getMyCart();
          setCartData(res.data ?? null);
        }
      } catch (err) {
        console.error('Failed to load cart for checkout:', err);
      } finally {
        setIsFetchingCart(false);
      }
    };
    
    loadCart();
    window.scrollTo(0, 0);
  }, [state]);

  const methods = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: '',
      gender: '',
      phone: '',
      email: '',
      address: '',
      note: '',
      couponCode: '',
      shippingMethod: ShippingMethod.STANDARD,
      paymentMethod: PaymentMethod.COD,
    },
    mode: 'onTouched',
  });

  const onSubmit = async (data: CheckoutFormValues) => {
    if (!cartData) return;
    
    setIsLoading(true);
    try {
      let finalCartItemIds: number[] = [];
      const isBuyNow = state?.isBuyNow && !!state?.buyNowItem;

      if (isBuyNow) {
        // "Mua ngay" xử lý ngầm: thêm vào giỏ hàng để có entity ID hợp lệ trước khi order
        const res = await cartService.addToCart({
          variantId: state.buyNowItem.variant.id,
          quantity: state.buyNowItem.quantity,
        });
        const addedItem = res.data?.cartItems?.find(
          item => item.variantId === state.buyNowItem.variant.id
        );
        if (addedItem) {
          finalCartItemIds = [addedItem.id];
        } else {
          throw new Error('Lỗi đồng bộ giỏ hàng, không thể Mua Ngay');
        }
      } else {
        finalCartItemIds = cartData.cartItems.map(item => item.id);
      }

      if (finalCartItemIds.length === 0) {
        alert('Đơn hàng không có sản phẩm!');
        setIsLoading(false);
        return;
      }

      const shippingFee = data.shippingMethod === ShippingMethod.EXPRESS ? 50000 : 30000;
      const total = cartData.totalPrice + shippingFee;

      const orderRequest = {
        name: data.name,
        gender: data.gender ? (data.gender as Gender) : undefined,
        phone: data.phone,
        email: data.email,
        shippingAddress: data.address,
        note: data.note,
        shippingMethod: data.shippingMethod,
        shippingFee: shippingFee,
        total: total,
        couponCode: data.couponCode,
        cartItemIds: finalCartItemIds,
        paymentMethod: data.paymentMethod,
      };

      const res = await orderService.createOrder(orderRequest);
      const orderId = res.data?.id;
      const responsePaymentMethod = res.data?.paymentMethod || data.paymentMethod;

      if (responsePaymentMethod === PaymentMethod.VNPAY) {
        if (!orderId) {
          throw new Error('Không tìm thấy mã đơn hàng để tạo thanh toán VNPAY');
        }

        const paymentRes = await paymentService.createPaymentUrl({
          orderId,
          bankCode: '',
          language: 'vn',
        });
        
        const paymentUrl = paymentRes.data?.paymentUrl;
        if (paymentUrl) {
          window.location.href = paymentUrl;
          return; // Không setIsLoading(false) vì đang redirect
        }

        throw new Error('Không lấy được đường dẫn thanh toán VNPAY');
      }

      alert('Đặt hàng thành công!');
      navigate('/');
    } catch (error) {
      console.error('Lỗi khi đặt hàng:', error);
      alert('Có lỗi xảy ra, vui lòng thử lại sau.');
      setIsLoading(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8 py-8 md:py-12 bg-slate-50">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Thanh toán</h1>
        <p className="mt-2 text-slate-500">Hoàn tất thông tin đơn hàng của bạn</p>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="flex flex-col lg:flex-row gap-8 xl:gap-12 relative">
          
          {/* Left Column: Forms */}
          <div className="w-full lg:w-2/3 flex flex-col">
            <CheckoutForm />
            <ShippingMethods />
            <PaymentMethods />
          </div>

          {/* Right Column: Order Summary */}
          <div className="w-full lg:w-1/3 relative">
            {cartData ? (
              <OrderSummary cart={cartData} isLoading={isLoading || isFetchingCart} />
            ) : isFetchingCart ? (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-center py-12">
                <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin"></div>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center text-slate-500 py-12">
                Không tìm thấy thông tin đơn hàng.
              </div>
            )}
          </div>

        </form>
      </FormProvider>
    </main>
  );
};

export default Checkout;
