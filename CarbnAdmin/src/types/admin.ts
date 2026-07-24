export type AdminRole =
  | "super_admin"
  | "admin"
  | "reviewer"
  | "support";

export type AdminStatus =
  | "active"
  | "inactive"
  | "suspended";

export interface Admin {
  id: string;
  auth_user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: AdminRole;
  status: AdminStatus;
  last_login_at: string | null;
  created_at: string;
}

export interface AdminSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  expires_in: number;
  token_type: string;
}

export interface AdminLoginResponse {
  success: boolean;
  message: string;
  data: {
    admin: Admin;
    session: AdminSession;
  };
}
