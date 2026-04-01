import { useFormContext } from 'react-hook-form';
import { Banknote, Smartphone } from 'lucide-react';
import { PaymentMethod } from '../../types/enums';

const PaymentMethods = () => {
  const { register, watch } = useFormContext();
  const selectedMethod = watch('paymentMethod');

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
      <h2 className="text-xl font-bold text-slate-900 mb-4">Phương thức thanh toán</h2>
      
      <div className="flex flex-col gap-4">
        {/* COD */}
        <label className={`relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
           selectedMethod === PaymentMethod.COD ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
        }`}>
          <input 
            type="radio" 
            value={PaymentMethod.COD}
            {...register('paymentMethod')}
            className="hidden"
          />
          <div className="h-5 w-5 rounded-full border-2 border-slate-300 flex items-center justify-center bg-white shrink-0">
             {selectedMethod === PaymentMethod.COD && <div className="h-2.5 w-2.5 rounded-full bg-indigo-600" />}
          </div>
          <div className={`p-2 rounded-lg bg-emerald-100 text-emerald-600`}>
            <Banknote size={24} />
          </div>
          <div>
            <span className="font-semibold text-slate-800 block">Thanh toán khi nhận hàng (COD)</span>
            <span className="text-sm text-slate-500">Thanh toán cho người giao hàng</span>
          </div>
        </label>

        {/* VNPAY */}
        <label className={`relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
           selectedMethod === PaymentMethod.VNPAY ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
        }`}>
          <input 
            type="radio" 
            value={PaymentMethod.VNPAY}
            {...register('paymentMethod')}
            className="hidden"
          />
          <div className="h-5 w-5 rounded-full border-2 border-slate-300 flex items-center justify-center bg-white shrink-0">
             {selectedMethod === PaymentMethod.VNPAY && <div className="h-2.5 w-2.5 rounded-full bg-indigo-600" />}
          </div>
          <div className={`p-2 rounded-lg bg-blue-100 text-blue-600`}>
            <Smartphone size={24} />
          </div>
          <div>
            <span className="font-semibold text-slate-800 block">Thanh toán qua VNPAY</span>
            <span className="text-sm text-slate-500">Quét mã QR hoặc dùng thẻ ATM/Visa</span>
          </div>
        </label>
      </div>
    </div>
  );
};

export default PaymentMethods;
