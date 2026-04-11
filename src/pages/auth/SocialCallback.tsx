import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';

import { authService } from '../../services/authService';
import { setAuthSession } from '../../utils/authStorage';
import { scheduleTokenRefresh } from '../../utils/tokenRefresh';
import { getApiErrorMessage } from '../../utils/apiError';
import { SocialLoginType } from '../../types';

const providerLabels: Record<string, string> = {
  google: 'Google',
  facebook: 'Facebook',
};

const providerTypes: Record<string, SocialLoginType> = {
  google: SocialLoginType.GOOGLE,
  facebook: SocialLoginType.FACEBOOK,
};

type SocialCallbackProps = {
  provider: 'google' | 'facebook';
};

export default function SocialCallback({ provider }: SocialCallbackProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [message, setMessage] = useState('');

  const providerLabel = useMemo(
    () => providerLabels[provider] ?? 'Social',
    [provider]
  );

  useEffect(() => {
    const handleCallback = async () => {
      setStatus('loading');
      setMessage('');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      if (error) {
        setStatus('error');
        setMessage(errorDescription || 'Dang nhap that bai. Vui long thu lai.');
        return;
      }

      const code = searchParams.get('code');
      const redirectTo = searchParams.get('redirect') || '/';

      const socialLoginType = providerTypes[provider];

      if (!code) {
        setStatus('error');
        setMessage('Khong nhan duoc ma dang nhap tu he thong.');
        return;
      }

      if (!socialLoginType) {
        setStatus('error');
        setMessage('Loai dang nhap khong hop le.');
        return;
      }

      try {
        const res = await authService.socialLoginCallback(socialLoginType, code);
        const loginData = res.data;
        if (!loginData?.accessToken) {
          setStatus('error');
          setMessage(res.message || 'Dang nhap that bai.');
          return;
        }
        setAuthSession(loginData);
        scheduleTokenRefresh(loginData.expiresIn);
        navigate(redirectTo.startsWith('/') ? redirectTo : '/', { replace: true });
      } catch (err) {
        setStatus('error');
        setMessage(getApiErrorMessage(err, 'Dang nhap that bai.'));
      }
    };

    handleCallback();
  }, [navigate, searchParams, provider]);

  return (
    <div className="text-center">
      {status === 'loading' ? (
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          <p className="text-sm text-slate-600">
            Dang xu ly dang nhap {providerLabel}...
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <AlertCircle className="h-6 w-6 text-rose-500" />
          <p className="text-sm text-slate-600">{message}</p>
          <Link
            to="/auth/login"
            className="text-sm font-semibold text-indigo-600 hover:underline"
          >
            Quay lai trang dang nhap
          </Link>
        </div>
      )}
    </div>
  );
}
