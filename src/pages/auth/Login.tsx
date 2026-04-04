import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { type Resolver, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { LogIn, AlertCircle } from 'lucide-react';

import { authService } from '../../services/authService';
import { setAuthSession } from '../../utils/authStorage';
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

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => handleSocialLogin(SocialLoginType.GOOGLE)}
          disabled={!!socialLoading}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {socialLoading === SocialLoginType.GOOGLE
            ? 'Dang chuyen huong...'
            : 'Dang nhap Google'}
        </button>
        <button
          type="button"
          onClick={() => handleSocialLogin(SocialLoginType.FACEBOOK)}
          disabled={!!socialLoading}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {socialLoading === SocialLoginType.FACEBOOK
            ? 'Dang chuyen huong...'
            : 'Dang nhap Facebook'}
        </button>
      </div>

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
