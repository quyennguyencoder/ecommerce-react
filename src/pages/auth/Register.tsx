import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { type Resolver, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { UserPlus, AlertCircle } from 'lucide-react';

import { userService } from '../../services/userService';
import { Gender } from '../../types/enums';
import { getApiErrorMessage } from '../../utils/apiError';

const registerSchema = z
  .object({
    email: z.string().min(1, 'Nhập email').email('Email không hợp lệ'),
    phone: z
      .string()
      .min(1, 'Nhập số điện thoại')
      .regex(/^[0-9+\s-]{9,20}$/, 'Số điện thoại không hợp lệ'),
    name: z.string().min(2, 'Họ tên ít nhất 2 ký tự').max(120),
    password: z.string().min(6, 'Mật khẩu ít nhất 6 ký tự'),
    confirmPassword: z.string().min(1, 'Nhập lại mật khẩu'),
    address: z.string().optional(),
    dob: z.string().optional(),
    gender: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

function parseGender(value: string | undefined): Gender | undefined {
  if (!value || value === '') return undefined;
  if (Object.values(Gender).includes(value as Gender)) return value as Gender;
  return undefined;
}

const Register = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema) as Resolver<RegisterFormValues>,
    defaultValues: {
      email: '',
      phone: '',
      name: '',
      password: '',
      confirmPassword: '',
      address: '',
      dob: '',
      gender: '',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setServerError(null);
    setIsSubmitting(true);
    try {
      const gender = parseGender(data.gender);
      const res = await userService.createUser({
        email: data.email.trim(),
        phone: data.phone.replace(/\s/g, ''),
        name: data.name.trim(),
        password: data.password,
        ...(gender ? { gender } : {}),
        ...(data.address?.trim() ? { address: data.address.trim() } : {}),
        ...(data.dob?.trim() ? { dob: data.dob.trim() } : {}),
      });

      if (!res.data) {
        setServerError(res.message || 'Đăng ký thất bại.');
        return;
      }

      navigate('/auth/login?registered=1', { replace: true });
    } catch (err) {
      setServerError(getApiErrorMessage(err, 'Đăng ký thất bại.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="text-center sm:text-left">
      <h2 className="text-2xl font-bold text-slate-900">Tạo tài khoản</h2>
      <p className="mt-1 text-sm text-slate-500">Điền thông tin để đăng ký thành viên.</p>

      {serverError && (
        <div className="mt-4 flex gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-left text-sm text-rose-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4 text-left">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="reg-name" className="mb-1.5 block text-sm font-medium text-slate-700">
              Họ và tên <span className="text-rose-500">*</span>
            </label>
            <input
              id="reg-name"
              type="text"
              autoComplete="name"
              {...register('name')}
              className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-4 ${
                errors.name
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
                  : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-xs font-medium text-rose-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="reg-email" className="mb-1.5 block text-sm font-medium text-slate-700">
              Email <span className="text-rose-500">*</span>
            </label>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              {...register('email')}
              className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-4 ${
                errors.email
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
                  : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-xs font-medium text-rose-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="reg-phone" className="mb-1.5 block text-sm font-medium text-slate-700">
              Số điện thoại <span className="text-rose-500">*</span>
            </label>
            <input
              id="reg-phone"
              type="tel"
              autoComplete="tel"
              {...register('phone')}
              placeholder="Ví dụ: 0912345678"
              className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-4 ${
                errors.phone
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
                  : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'
              }`}
            />
            {errors.phone && (
              <p className="mt-1 text-xs font-medium text-rose-600">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="reg-password" className="mb-1.5 block text-sm font-medium text-slate-700">
              Mật khẩu <span className="text-rose-500">*</span>
            </label>
            <input
              id="reg-password"
              type="password"
              autoComplete="new-password"
              {...register('password')}
              className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-4 ${
                errors.password
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
                  : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'
              }`}
            />
            {errors.password && (
              <p className="mt-1 text-xs font-medium text-rose-600">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="reg-confirm-password"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Xác nhận mật khẩu <span className="text-rose-500">*</span>
            </label>
            <input
              id="reg-confirm-password"
              type="password"
              autoComplete="new-password"
              {...register('confirmPassword')}
              className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-4 ${
                errors.confirmPassword
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
                  : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'
              }`}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs font-medium text-rose-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="reg-address" className="mb-1.5 block text-sm font-medium text-slate-700">
              Địa chỉ
            </label>
            <input
              id="reg-address"
              type="text"
              autoComplete="street-address"
              {...register('address')}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label htmlFor="reg-dob" className="mb-1.5 block text-sm font-medium text-slate-700">
              Ngày sinh
            </label>
            <input
              id="reg-dob"
              type="date"
              {...register('dob')}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label htmlFor="reg-gender" className="mb-1.5 block text-sm font-medium text-slate-700">
              Giới tính
            </label>
            <select
              id="reg-gender"
              {...register('gender')}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            >
              <option value="">— Chọn —</option>
              <option value={Gender.MALE}>Nam</option>
              <option value={Gender.FEMALE}>Nữ</option>
              <option value={Gender.OTHER}>Khác</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <UserPlus className="h-4 w-4" />
          {isSubmitting ? 'Đang gửi...' : 'Đăng ký'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Đã có tài khoản?{' '}
        <Link to="/auth/login" className="font-semibold text-indigo-600 hover:underline">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
};

export default Register;
