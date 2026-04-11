import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { type Resolver, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { LogIn, AlertCircle } from 'lucide-react';

import { authService } from '../../services/authService';
import { setAuthSession } from '../../utils/authStorage';
import { scheduleTokenRefresh } from '../../utils/tokenRefresh';
import { getApiErrorMessage } from '../../utils/apiError';
import { SocialLoginType } from '../../types';

const loginSchema = z.object({
  emailOrPhone: z.string().min(1, 'Nhập email hoặc số điện thoại'),
  password: z.string().min(1, 'Nhập mật khẩu'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const registered = searchParams.get('registered') === '1';
  const redirectTo = searchParams.get('redirect') || '/';

  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialLoading, setSocialLoading] = useState<SocialLoginType | null>(null);

  const {
    register,
    handleSubmit,
      formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema) as Resolver<LoginFormValues>,
    defaultValues: { emailOrPhone: '', password: '' },
  });

  useEffect(() => {
    if (registered) {
      setServerError(null);
    }
  }, [registered]);

  const onSubmit = async (data: LoginFormValues) => {
    setServerError(null);
    setIsSubmitting(true);
    try {
      const res = await authService.login({
        emailOrPhone: data.emailOrPhone.trim(),
        password: data.password,
      });
      const loginData = res.data;
      if (!loginData?.accessToken) {
        setServerError(res.message || 'Đăng nhập thất bại.');
        return;
      }
      setAuthSession(loginData);
      scheduleTokenRefresh(loginData.expiresIn);
      navigate(redirectTo.startsWith('/') ? redirectTo : '/', { replace: true });
    } catch (err) {
      setServerError(getApiErrorMessage(err, 'Đăng nhập thất bại.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = async (provider: SocialLoginType) => {
    setServerError(null);
    setSocialLoading(provider);
    try {
      const res = await authService.generateSocialAuthUrl(provider);
      const authUrl = res.data?.authUrl;
      if (!authUrl) {
        setServerError(res.message || 'Khong the tao duong dan dang nhap.');
        return;
      }
      window.location.href = authUrl;
    } catch (err) {
      setServerError(getApiErrorMessage(err, 'Khong the tao duong dan dang nhap.'));
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <div className="text-center sm:text-left">
      <h2 className="text-2xl font-bold text-slate-900">Đăng nhập</h2>
      <p className="mt-1 text-sm text-slate-500">
        Chào mừng bạn quay lại. Vui lòng nhập thông tin tài khoản.
      </p>

      {registered && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-left text-sm text-emerald-800">
          Đăng ký thành công. Bạn có thể đăng nhập ngay.
        </div>
      )}

      {serverError && (
        <div className="mt-4 flex gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-left text-sm text-rose-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4 text-left">
        <div>
          <label htmlFor="login-email-phone" className="mb-1.5 block text-sm font-medium text-slate-700">
            Email hoặc số điện thoại
          </label>
          <input
            id="login-email-phone"
            type="text"
            autoComplete="username"
            {...register('emailOrPhone')}
            className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-4 ${
              errors.emailOrPhone
                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
                : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'
            }`}
          />
          {errors.emailOrPhone && (
            <p className="mt-1 text-xs font-medium text-rose-600">{errors.emailOrPhone.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-slate-700">
            Mật khẩu
          </label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
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

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <LogIn className="h-4 w-4" />
          {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => handleSocialLogin(SocialLoginType.GOOGLE)}
          disabled={!!socialLoading}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <span className="inline-flex h-5 w-5 items-center justify-center">
            <svg viewBox="0 0 48 48" aria-hidden="true" className="h-5 w-5">
              <path
                fill="#FFC107"
                d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 6 1.2 8.1 3.2l5.7-5.7C34.2 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
              />
              <path
                fill="#FF3D00"
                d="M6.3 14.7l6.6 4.8C14.6 16 19 12 24 12c3.1 0 6 1.2 8.1 3.2l5.7-5.7C34.2 6.1 29.3 4 24 4 16 4 9.1 8.6 6.3 14.7z"
              />
              <path
                fill="#4CAF50"
                d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.2C29.4 35.3 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.6 5.1C8.9 39.4 16 44 24 44z"
              />
              <path
                fill="#1976D2"
                d="M43.6 20.5H42V20H24v8h11.3c-1 2.7-3 5-5.6 6.6l6.3 5.2C38.9 37.1 44 31.5 44 24c0-1.3-.1-2.7-.4-3.5z"
              />
            </svg>
          </span>
          {socialLoading === SocialLoginType.GOOGLE
            ? 'Dang chuyen huong...'
            : 'Dang nhap Google'}
        </button>
        <button
          type="button"
          onClick={() => handleSocialLogin(SocialLoginType.FACEBOOK)}
          disabled={!!socialLoading}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <span className="inline-flex h-5 w-5 items-center justify-center">
            <svg viewBox="0 0 48 48" aria-hidden="true" className="h-5 w-5">
              <path
                fill="#1877F2"
                d="M24 4c11 0 20 9 20 20s-9 20-20 20S4 35 4 24 13 4 24 4z"
              />
              <path
                fill="#FFFFFF"
                d="M27.5 16.7h3.9V13h-3.9c-4 0-6.5 2.4-6.5 6.3v3.1h-3.5V26h3.5v9.3h3.7V26h3.5l.7-3.6h-4.2v-2.9c0-1.6.8-2.8 2.8-2.8z"
              />
            </svg>
          </span>
          {socialLoading === SocialLoginType.FACEBOOK
            ? 'Dang chuyen huong...'
            : 'Dang nhap Facebook'}
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-slate-600">
        Chưa có tài khoản?{' '}
        <Link to="/auth/register" className="font-semibold text-indigo-600 hover:underline">
          Đăng ký
        </Link>
      </p>
    </div>
  );
};

export default Login;
