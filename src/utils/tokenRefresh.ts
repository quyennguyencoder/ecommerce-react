import { authService } from '../services/authService';
import {
  clearAuthSession,
  getAccessTokenExpiresAt,
  getRefreshToken,
  setAuthTokens,
} from './authStorage';

const REFRESH_BUFFER_MS = 60_000;
const MIN_REFRESH_DELAY_MS = 1000;

let refreshTimeoutId: number | null = null;
let isRefreshing = false;

export function clearRefreshTimer(): void {
  if (refreshTimeoutId !== null) {
    window.clearTimeout(refreshTimeoutId);
    refreshTimeoutId = null;
  }
}

async function refreshAccessToken(): Promise<void> {
  if (isRefreshing) return;
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearAuthSession();
    return;
  }

  isRefreshing = true;
  try {
    const res = await authService.refreshToken({ refreshToken });
    const data = res.data;
    if (!data?.accessToken || !data?.refreshToken) {
      clearAuthSession();
      return;
    }

    setAuthTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresIn: data.expiresIn,
    });

    scheduleTokenRefresh(data.expiresIn);
  } catch {
    clearAuthSession();
  } finally {
    isRefreshing = false;
  }
}

export function scheduleTokenRefresh(expiresInMs?: number): void {
  clearRefreshTimer();
  const expiresAt =
    typeof expiresInMs === 'number'
      ? Date.now() + expiresInMs
      : getAccessTokenExpiresAt();

  if (!expiresAt) return;
  const bufferMs =
    typeof expiresInMs === 'number'
      ? Math.min(REFRESH_BUFFER_MS, Math.max(1000, Math.floor(expiresInMs * 0.2)))
      : REFRESH_BUFFER_MS;
  const delay = Math.max(expiresAt - Date.now() - bufferMs, MIN_REFRESH_DELAY_MS);

  refreshTimeoutId = window.setTimeout(() => {
    void refreshAccessToken();
  }, delay);
}

export function initTokenRefresh(): void {
  scheduleTokenRefresh();
}
