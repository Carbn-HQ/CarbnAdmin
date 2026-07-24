import type { Admin } from "../types/admin";

const ACCESS_TOKEN_KEY = "carbn_admin_access_token";
const REFRESH_TOKEN_KEY = "carbn_admin_refresh_token";
const ADMIN_KEY = "carbn_admin";
const EXPIRES_AT_KEY = "carbn_admin_expires_at";

interface SaveAdminSessionInput {
  admin: Admin;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export const saveAdminSession = ({
  admin,
  accessToken,
  refreshToken,
  expiresAt,
}: SaveAdminSessionInput): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
  localStorage.setItem(EXPIRES_AT_KEY, String(expiresAt));
};

export const getAdminAccessToken = (): string | null =>
  localStorage.getItem(ACCESS_TOKEN_KEY);

export const getAdminRefreshToken = (): string | null =>
  localStorage.getItem(REFRESH_TOKEN_KEY);

export const getAdminExpiresAt = (): number | null => {
  const value = localStorage.getItem(EXPIRES_AT_KEY);
  return value ? Number(value) : null;
};

export const getStoredAdmin = (): Admin | null => {
  const value = localStorage.getItem(ADMIN_KEY);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as Admin;
  } catch {
    return null;
  }
};

export const clearAdminSession = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(ADMIN_KEY);
  localStorage.removeItem(EXPIRES_AT_KEY);
};

export const hasAdminSession = (): boolean =>
  Boolean(getAdminAccessToken());
