import { useFormContext } from 'react-hook-form';

const CheckoutForm = () => {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
      <h2 className="text-xl font-bold text-slate-900 mb-6">Thông tin giao hàng</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">
            Họ và tên người nhận <span className="text-rose-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            {...register('name')}
            placeholder="Ví dụ: Nguyễn Văn A"
            className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-all ${
              errors.name ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-50' : 'border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50'
            }`}
          />
          {errors.name && (
            <p className="mt-1.5 text-sm text-rose-500 font-medium opacity-90">{errors.name.message as string}</p>
          )}
        </div>

        {/* Gender */}
        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-slate-700 mb-1.5">
            Giới tính (Tùy chọn)
          </label>
          <select
            id="gender"
            {...register('gender')}
            className={`w-full px-4 py-2.5 rounded-xl border border-slate-300 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 bg-white`}
          >
            <option value="">Không chọn</option>
            <option value="MALE">Nam</option>
            <option value="FEMALE">Nữ</option>
            <option value="OTHER">Khác</option>
          </select>
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1.5">
            Số điện thoại <span className="text-rose-500">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            {...register('phone')}
            placeholder="0912345678"
            className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-all ${
               errors.phone ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-50' : 'border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50'
            }`}
          />
          {errors.phone && (
            <p className="mt-1.5 text-sm text-rose-500 font-medium opacity-90">{errors.phone.message as string}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
            Email xác nhận <span className="text-rose-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            placeholder="email@example.com"
            className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-all ${
               errors.email ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-50' : 'border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50'
            }`}
          />
          {errors.email && (
            <p className="mt-1.5 text-sm text-rose-500 font-medium opacity-90">{errors.email.message as string}</p>
          )}
        </div>

        {/* Address */}
        <div className="md:col-span-2">
          <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-1.5">
            Địa chỉ nhận hàng chi tiết <span className="text-rose-500">*</span>
          </label>
          <input
            id="address"
            type="text"
            {...register('address')}
            placeholder="Số nhà, Tên đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố"
            className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-all ${
               errors.address ? 'border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-50' : 'border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50'
            }`}
          />
          {errors.address && (
            <p className="mt-1.5 text-sm text-rose-500 font-medium opacity-90">{errors.address.message as string}</p>
          )}
        </div>

        {/* Note */}
        <div className="md:col-span-2">
          <label htmlFor="note" className="block text-sm font-medium text-slate-700 mb-1.5">
            Ghi chú (Tùy chọn)
          </label>
          <textarea
            id="note"
            {...register('note')}
            rows={3}
            placeholder="Giao hàng buổi sáng, gọi điện trước khi giao..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 resize-y"
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;
