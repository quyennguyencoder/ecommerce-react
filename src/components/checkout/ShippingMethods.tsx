import { useFormContext } from 'react-hook-form';
import { Truck, Zap } from 'lucide-react';
import { ShippingMethod } from '../../types/enums';

const ShippingMethods = () => {
  const { register, watch } = useFormContext();
  const selectedMethod = watch('shippingMethod');

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
      <h2 className="text-xl font-bold text-slate-900 mb-4">Phương thức vận chuyển</h2>
      
      <div className="grid gap-4 md:grid-cols-2">
        {/* Standard Shipping */}
        <label className={`relative flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
          selectedMethod === ShippingMethod.STANDARD ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
        }`}>
          <input 
            type="radio" 
            value={ShippingMethod.STANDARD} 
            {...register('shippingMethod')}
            className="hidden"
          />
          <div className={`mt-0.5 p-2 rounded-full ${selectedMethod === ShippingMethod.STANDARD ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
            <Truck size={20} />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className={`font-semibold ${selectedMethod === ShippingMethod.STANDARD ? 'text-indigo-900' : 'text-slate-800'}`}>
                Giao hàng Tiêu chuẩn
              </span>
              <span className="font-bold text-slate-900">30.000đ</span>
            </div>
            <p className="text-sm text-slate-500">Dự kiến nhận hàng trong 3-5 ngày làm việc</p>
          </div>
        </label>

        {/* Express Shipping */}
        <label className={`relative flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
          selectedMethod === ShippingMethod.EXPRESS ? 'border-rose-500 bg-rose-50/50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
        }`}>
          <input 
            type="radio" 
            value={ShippingMethod.EXPRESS} 
            {...register('shippingMethod')}
            className="hidden"
          />
          <div className={`mt-0.5 p-2 rounded-full ${selectedMethod === ShippingMethod.EXPRESS ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
            <Zap size={20} />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className={`font-semibold ${selectedMethod === ShippingMethod.EXPRESS ? 'text-rose-900' : 'text-slate-800'}`}>
                Giao Hỏa tốc
              </span>
              <span className="font-bold text-slate-900">50.000đ</span>
            </div>
            <p className="text-sm text-slate-500">Nhận hàng trong vòng 2-4 tiếng (Nội thành)</p>
          </div>
        </label>
      </div>
    </div>
  );
};

export default ShippingMethods;
