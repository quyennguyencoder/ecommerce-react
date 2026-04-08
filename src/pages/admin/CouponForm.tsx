import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { couponService } from '../../services/couponService';
import type { CouponResponse, CouponCreateRequest } from '../../types';
import { DiscountType } from '../../types/enums';

const couponSchema = z.object({
  code: z.string().min(1, 'Vui lòng nhập mã coupon').max(50, 'Mã coupon tối đa 50 ký tự'),
  discountType: z.nativeEnum(DiscountType, { message: 'Vui lòng chọn loại giảm giá' }),
  discountValue: z.coerce.number().min(0, 'Giá trị giảm giá phải lớn hơn hoặc bằng 0'),
  minOrderValue: z.coerce.number().min(0, 'Giá trị đơn hàng tối thiểu phải lớn hơn hoặc bằng 0').optional(),
  maxDiscount: z.coerce.number().min(0, 'Giảm giá tối đa phải lớn hơn hoặc bằng 0').optional(),
  usageLimit: z.coerce.number().min(0, 'Giới hạn sử dụng phải lớn hơn hoặc bằng 0').optional(),
  startDate: z.string().min(1, 'Vui lòng chọn ngày bắt đầu'),
  endDate: z.string().min(1, 'Vui lòng chọn ngày kết thúc'),
  active: z.boolean().default(true),
});

type CouponFormValues = z.infer<typeof couponSchema>;

const toInputDateTime = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (num: number) => `${num}`.padStart(2, '0');
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
};

const AdminCouponForm = () => {
  const navigate = useNavigate();
  const { id: idParam } = useParams();
  const couponId = idParam ? Number(idParam) : NaN;
  const isEditMode = Number.isFinite(couponId) && couponId > 0;

  const [isLoadingCoupon, setIsLoadingCoupon] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const defaultValues = useMemo<CouponFormValues>(
    () => ({
      code: '',
      discountType: DiscountType.PERCENTAGE,
      discountValue: 0,
      minOrderValue: 0,
      maxDiscount: 0,
      usageLimit: 0,
      startDate: '',
      endDate: '',
      active: true,
    }),
    []
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema) as any,
    defaultValues,
  });

  useEffect(() => {
    if (!isEditMode) return;

    const loadCoupon = async () => {
      try {
        setIsLoadingCoupon(true);
        setLoadError(null);
        const res = await couponService.getCouponById(couponId);
        const coupon = res.data as CouponResponse | undefined;
        if (!coupon) {
          setLoadError('Không tìm thấy coupon.');
          return;
        }
        reset({
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          minOrderValue: coupon.minOrderValue,
          maxDiscount: coupon.maxDiscount,
          usageLimit: coupon.usageLimit,
          startDate: toInputDateTime(coupon.startDate),
          endDate: toInputDateTime(coupon.endDate),
          active: coupon.active,
        });
      } catch (err) {
        console.error('Lỗi tải coupon:', err);
        setLoadError('Không tải được thông tin coupon.');
      } finally {
        setIsLoadingCoupon(false);
      }
    };

    loadCoupon();
  }, [couponId, isEditMode, reset]);

  const onSubmit = async (data: CouponFormValues) => {
    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      const payload: CouponCreateRequest = {
        code: data.code,
        discountType: data.discountType,
        discountValue: data.discountValue,
        minOrderValue: data.minOrderValue,
        maxDiscount: data.maxDiscount,
        usageLimit: data.usageLimit,
        startDate: data.startDate,
        endDate: data.endDate,
        active: data.active,
      };

      if (isEditMode) {
        await couponService.updateCoupon(couponId, payload);
        alert('Đã cập nhật coupon thành công!');
      } else {
        await couponService.createCoupon(payload);
        alert('Đã tạo coupon thành công!');
      }

      navigate('/admin/coupons');
    } catch (err: any) {
      console.error('Lỗi lưu coupon:', err);
      setErrorMsg(
        err.message ||
          (isEditMode
            ? 'Không thể cập nhật coupon lúc này.'
            : 'Không thể tạo coupon lúc này.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEditMode && isLoadingCoupon) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-slate-500">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="font-medium">Đang tải coupon...</p>
      </div>
    );
  }

  if (isEditMode && loadError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 pb-4 border-b border-slate-200">
          <Link
            to="/admin/coupons"
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Chỉnh sửa Coupon</h1>
        </div>
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl flex gap-3 items-start">
          <AlertCircle size={22} className="shrink-0 mt-0.5" />
          <p className="font-medium">{loadError}</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/coupons"
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">
            {isEditMode ? 'Chỉnh sửa Coupon' : 'Thêm mới Coupon'}
          </h1>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save size={20} />
          )}
          {isSubmitting ? 'Đang lưu...' : isEditMode ? 'Cập nhật Coupon' : 'Lưu Coupon'}
        </button>
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl flex gap-3 items-start">
          <AlertCircle size={22} className="shrink-0 mt-0.5" />
          <p className="font-medium">{errorMsg}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="code">
                Mã coupon
              </label>
              <input
                id="code"
                {...register('code')}
                placeholder="VD: SPRING50"
                className={`w-full px-4 py-2.5 rounded-xl border ${
                  errors.code ? 'border-rose-400' : 'border-slate-200'
                } focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all`}
              />
              {errors.code && <p className="text-rose-500 text-sm mt-2">{errors.code.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="discountType">
                  Loại giảm giá
                </label>
                <select
                  id="discountType"
                  {...register('discountType')}
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    errors.discountType ? 'border-rose-400' : 'border-slate-200'
                  } focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all bg-white`}
                >
                  <option value={DiscountType.PERCENTAGE}>Phần trăm</option>
                  <option value={DiscountType.FIXED_AMOUNT}>Giá cố định</option>
                </select>
                {errors.discountType && (
                  <p className="text-rose-500 text-sm mt-2">{errors.discountType.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="discountValue">
                  Giá trị giảm
                </label>
                <input
                  id="discountValue"
                  type="number"
                  step="0.01"
                  {...register('discountValue')}
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    errors.discountValue ? 'border-rose-400' : 'border-slate-200'
                  } focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all`}
                />
                {errors.discountValue && (
                  <p className="text-rose-500 text-sm mt-2">{errors.discountValue.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="minOrderValue">
                  Đơn tối thiểu
                </label>
                <input
                  id="minOrderValue"
                  type="number"
                  {...register('minOrderValue')}
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    errors.minOrderValue ? 'border-rose-400' : 'border-slate-200'
                  } focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all`}
                />
                {errors.minOrderValue && (
                  <p className="text-rose-500 text-sm mt-2">{errors.minOrderValue.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="maxDiscount">
                  Giảm tối đa
                </label>
                <input
                  id="maxDiscount"
                  type="number"
                  {...register('maxDiscount')}
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    errors.maxDiscount ? 'border-rose-400' : 'border-slate-200'
                  } focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all`}
                />
                {errors.maxDiscount && (
                  <p className="text-rose-500 text-sm mt-2">{errors.maxDiscount.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="usageLimit">
                  Giới hạn dùng
                </label>
                <input
                  id="usageLimit"
                  type="number"
                  {...register('usageLimit')}
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    errors.usageLimit ? 'border-rose-400' : 'border-slate-200'
                  } focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all`}
                />
                {errors.usageLimit && (
                  <p className="text-rose-500 text-sm mt-2">{errors.usageLimit.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="startDate">
                  Ngày bắt đầu
                </label>
                <input
                  id="startDate"
                  type="datetime-local"
                  {...register('startDate')}
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    errors.startDate ? 'border-rose-400' : 'border-slate-200'
                  } focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all`}
                />
                {errors.startDate && (
                  <p className="text-rose-500 text-sm mt-2">{errors.startDate.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="endDate">
                  Ngày kết thúc
                </label>
                <input
                  id="endDate"
                  type="datetime-local"
                  {...register('endDate')}
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    errors.endDate ? 'border-rose-400' : 'border-slate-200'
                  } focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all`}
                />
                {errors.endDate && (
                  <p className="text-rose-500 text-sm mt-2">{errors.endDate.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input id="active" type="checkbox" {...register('active')} className="w-4 h-4" />
              <label htmlFor="active" className="text-sm font-semibold text-slate-700">
                Kích hoạt coupon
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Lưu ý</h2>
            <ul className="text-sm text-slate-500 space-y-2">
              <li>Mã coupon phân biệt chữ hoa/thường.</li>
              <li>Với giảm theo % bạn nên đặt giới hạn giảm tối đa.</li>
              <li>Ngày hiệu lực dùng định dạng giờ địa phương.</li>
            </ul>
          </div>
        </div>
      </div>
    </form>
  );
};

export default AdminCouponForm;
