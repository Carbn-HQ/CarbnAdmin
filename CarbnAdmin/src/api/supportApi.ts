import apiClient from "./apiClient";
import type { ApiResponse } from "../types/api";

export interface AdminSupportReply {
  id: string;
  sender: "admin" | "user";
  message: string;
  created_at: string;
}

export interface AdminSupportRequest {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  category: string;
  category_label: string;
  subject: string;
  message: string;
  status: string;
  status_label: string;
  replies: AdminSupportReply[];
  opened: boolean;
  created_at: string;
}

export const getSupportUnreadCount = async () => {
  const response = await apiClient.get<ApiResponse<{ unread: number }>>(
    "/admin/support/unread-count"
  );
  return response.data;
};

export const getAdminSupportRequests = async () => {
  const response = await apiClient.get<
    ApiResponse<{ unread: number; requests: AdminSupportRequest[] }>
  >("/admin/support");
  return response.data;
};

export const openAdminSupportRequest = async (id: string) => {
  const response = await apiClient.post<
    ApiResponse<{ unread: number; request: AdminSupportRequest }>
  >(`/admin/support/${id}/open`);
  return response.data;
};

export const replyAdminSupportRequest = async (id: string, message: string) => {
  const response = await apiClient.post<
    ApiResponse<{ unread: number; request: AdminSupportRequest }>
  >(`/admin/support/${id}/reply`, { message });
  return response.data;
};

export interface AdminEmailChangeRequest {
  id: string;
  user_id: string;
  current_email: string;
  new_email: string;
  reason: string;
  status: string;
  status_label: string;
  opened: boolean;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  created_at: string;
  reviewed_at: string | null;
}

export const getAdminEmailChangeRequests = async () => {
  const response = await apiClient.get<
    ApiResponse<{ unread: number; pending: number; requests: AdminEmailChangeRequest[] }>
  >("/admin/support/email-changes");
  return response.data;
};

export const openAdminEmailChangeRequest = async (id: string) => {
  const response = await apiClient.post<
    ApiResponse<{ unread: number; request: AdminEmailChangeRequest }>
  >(`/admin/support/email-changes/${id}/open`);
  return response.data;
};

export const approveAdminEmailChangeRequest = async (id: string) => {
  const response = await apiClient.post<
    ApiResponse<{ unread: number; request: AdminEmailChangeRequest }>
  >(`/admin/support/email-changes/${id}/approve`);
  return response.data;
};

export const notifySupportUnread = (unread: number) => {
  window.dispatchEvent(new CustomEvent("carbn-support-unread", { detail: unread }));
};
