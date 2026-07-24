import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  getCurrentAdmin,
  loginAdmin,
  logoutAdmin,
} from "../api/adminAuthApi";

import {
  clearAdminSession,
  getAdminAccessToken,
  getStoredAdmin,
  saveAdminSession,
} from "../utils/tokenStorage";

import type { Admin } from "../types/admin";

interface LoginInput {
  email: string;
  password: string;
}

interface AdminAuthContextValue {
  admin: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshAdmin: () => Promise<void>;
}

export const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

interface Props {
  children: ReactNode;
}

export function AdminAuthProvider({ children }: Props) {
  const [admin, setAdmin] = useState<Admin | null>(getStoredAdmin());
  const [isLoading, setIsLoading] = useState(true);

  const refreshAdmin = useCallback(async () => {
    const token = getAdminAccessToken();

    if (!token) {
      setAdmin(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await getCurrentAdmin();
      setAdmin(response.data ?? null);
    } catch {
      clearAdminSession();
      setAdmin(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshAdmin();
  }, [refreshAdmin]);

  const login = async ({ email, password }: LoginInput) => {
    const response = await loginAdmin({ email, password });

    saveAdminSession({
      admin: response.data.admin,
      accessToken: response.data.session.access_token,
      refreshToken: response.data.session.refresh_token,
      expiresAt: response.data.session.expires_at,
    });

    setAdmin(response.data.admin);
  };

  const logout = async () => {
    try {
      await logoutAdmin();
    } finally {
      clearAdminSession();
      setAdmin(null);
    }
  };

  const value = useMemo(
    () => ({
      admin,
      isAuthenticated: Boolean(admin),
      isLoading,
      login,
      logout,
      refreshAdmin,
    }),
    [admin, isLoading, refreshAdmin]
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}
