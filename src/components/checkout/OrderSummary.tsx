import { useFormContext } from 'react-hook-form';
import type { CartResponse } from '../../types/responses';
import { ShippingMethod } from '../../types/enums';
import { getImageUrl } from '../../utils/image';

interface OrderSummaryProps {
  cart: CartResponse;
  isLoading: boolean;
}

const OrderSummary = ({ cart, isLoading }: OrderSummaryProps) => {
  const { watch, register } = useFormContext();
  const selectedShipping = watch('shippingMethod');
  
  const shippingFee = selectedShipping === ShippingMethod.EXPRESS ? 50000 : 30000;
  const subtotal = cart.totalPrice;
  const total = subtotal + shippingFee;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 lg:sticky lg:top-8 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900 mb-6">Đơn hàng của bạn ({cart.totalItems})</h2>
      
      {/* Items List */}
      <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300">
        {cart.cartItems.map((item) => (
          <div key={item.id} className="flex gap-4">
            <div className="h-16 w-16 bg-white rounded-lg border border-slate-200 overflow-hidden shrink-0">
              <img src={getImageUrl(item.image)} alt={item.productName} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <h4 className="text-sm font-semibold text-slate-800 line-clamp-1">{item.productName}</h4>
              <p className="text-xs text-slate-500 mt-0.5">Phân loại: {item.variantSku}</p>
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm font-semibold text-indigo-600">{formatCurrency(item.price)}</span>
                <span className="text-xs font-semibold px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-600">x{item.quantity}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="w-full h-px bg-slate-200 mb-6"></div>

      {/* Coupon Input */}
      <div className="mb-6 flex gap-2">
        <input 
          type="text" 
          placeholder="Mã giảm giá (nếu có)"
          {...register('couponCode')}
          className="flex-1 px-4 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-400"
        />
        <button 
          type="button" 
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 transition-colors text-white font-semibold text-sm rounded-xl whitespace-nowrap shadow-sm"
        >
          Áp dụng
        </button>
      </div>

      {/* Bill Details */}
      <div className="space-y-3 text-sm mb-6">
        <div className="flex justify-between text-slate-600">
          <span>Tạm tính</span>
          <span className="font-semibold text-slate-800">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Phí vận chuyển</span>
          <span className="font-semibold text-slate-800">{formatCurrency(shippingFee)}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Giảm giá</span>
          <span className="font-semibold text-rose-500">- đ0</span>
        </div>
      </div>

      <div className="w-full h-px bg-slate-200 mb-6"></div>

      {/* Total */}
      <div className="flex justify-between items-end mb-8">
        <span className="font-semibold text-slate-800 text-lg">Tổng cộng</span>
        <span className="text-2xl font-bold text-indigo-600">{formatCurrency(total)}</span>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 shadow-md transition-all disabled:opacity-70 flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          'THANH TOÁN (ĐẶT HÀNG)'
        )}
      </button>
      
      <p className="text-center text-xs text-slate-500 mt-4 leading-relaxed">
        Nhấn "Đặt Hàng" đồng nghĩa với việc bạn đồng ý với Điều khoản và Điều kiện của chúng tôi.
      </p>
    </div>
  );
};

export default OrderSummary;
