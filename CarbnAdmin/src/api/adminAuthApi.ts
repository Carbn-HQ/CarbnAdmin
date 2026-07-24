import apiClient from "./apiClient";
import type { Admin, AdminLoginResponse } from "../types/admin";
import type { ApiResponse } from "../types/api";

export interface InitialAdminSignupPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  bootstrap_secret: string;
}

export const signupInitialAdmin = async (
  payload: InitialAdminSignupPayload
): Promise<ApiResponse<Admin>> => {
  const response = await apiClient.post<ApiResponse<Admin>>(
    "/admin/signup-initial",
    payload
  );
  return response.data;
};

export interface AdminLoginPayload {
  email: string;
  password: string;
}

export const loginAdmin = async (
  payload: AdminLoginPayload
): Promise<AdminLoginResponse> => {
  const response = await apiClient.post<AdminLoginResponse>(
    "/admin/login",
    payload
  );
  return response.data;
};

export const getCurrentAdmin = async (): Promise<ApiResponse<Admin>> => {
  const response = await apiClient.get<ApiResponse<Admin>>("/admin/me");
  return response.data;
};

export const logoutAdmin = async (): Promise<ApiResponse<never>> => {
  const response = await apiClient.post<ApiResponse<never>>("/admin/logout");
  return response.data;
};
