import type { LoginResponse, UserResponse } from '../types';

const ACCESS_KEY = 'ec_access_token';
const REFRESH_KEY = 'ec_refresh_token';
const USER_KEY = 'ec_user';
const EXPIRES_AT_KEY = 'ec_access_expires_at';

export function setAuthSession(payload: LoginResponse): void {
  setAuthTokens({
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
    expiresIn: payload.expiresIn,
  });
  localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
}

export function setAuthTokens(payload: {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}): void {
  localStorage.setItem(ACCESS_KEY, payload.accessToken);
  localStorage.setItem(REFRESH_KEY, payload.refreshToken);
  setAccessTokenExpiresAt(Date.now() + payload.expiresIn);
}

export function clearAuthSession(): void {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(EXPIRES_AT_KEY);
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export function getAccessTokenExpiresAt(): number | null {
  const raw = localStorage.getItem(EXPIRES_AT_KEY);
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export function setAccessTokenExpiresAt(expiresAt: number): void {
  localStorage.setItem(EXPIRES_AT_KEY, String(expiresAt));
}

export function getStoredUser(): UserResponse | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserResponse;
  } catch {
    return null;
  }
}

export function setStoredUser(user: UserResponse): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}
