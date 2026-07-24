import apiClient from "./apiClient";
import type { ApiResponse, PaginatedResponse } from "../types/api";
import type {
  ApplicationFilters,
  BetaApplication,
  BetaMetrics,
  BetaStatus,
} from "../types/application";

export const getBetaDashboardMetrics = async (): Promise<ApiResponse<BetaMetrics>> => {
  const response = await apiClient.get<ApiResponse<BetaMetrics>>("/admin/beta/metrics");
  return response.data;
};

export const getBetaApplications = async (
  params: ApplicationFilters = {}
): Promise<PaginatedResponse<BetaApplication>> => {
  const response = await apiClient.get<PaginatedResponse<BetaApplication>>(
    "/admin/beta/applications",
    { params }
  );
  return response.data;
};

export const getPendingApplications = async (params: ApplicationFilters = {}) => {
  const response = await apiClient.get<PaginatedResponse<BetaApplication>>(
    "/admin/beta/applications/pending",
    { params }
  );
  return response.data;
};

export const getApprovedApplications = async (params: ApplicationFilters = {}) => {
  const response = await apiClient.get<PaginatedResponse<BetaApplication>>(
    "/admin/beta/applications/approved",
    { params }
  );
  return response.data;
};

export const getInvitedApplications = async (params: ApplicationFilters = {}) => {
  const response = await apiClient.get<PaginatedResponse<BetaApplication>>(
    "/admin/beta/applications/invited",
    { params }
  );
  return response.data;
};

export const getActiveApplications = async (params: ApplicationFilters = {}) => {
  const response = await apiClient.get<PaginatedResponse<BetaApplication>>(
    "/admin/beta/applications/active",
    { params }
  );
  return response.data;
};

export const getDeclinedApplications = async (params: ApplicationFilters = {}) => {
  const response = await apiClient.get<PaginatedResponse<BetaApplication>>(
    "/admin/beta/applications/declined",
    { params }
  );
  return response.data;
};

export const getSuspendedApplications = async (params: ApplicationFilters = {}) => {
  const response = await apiClient.get<PaginatedResponse<BetaApplication>>(
    "/admin/beta/applications/suspended",
    { params }
  );
  return response.data;
};

export const getCompletedApplications = async (params: ApplicationFilters = {}) => {
  const response = await apiClient.get<PaginatedResponse<BetaApplication>>(
    "/admin/beta/applications/completed",
    { params }
  );
  return response.data;
};

export const getEmailPendingApplications = async (params: ApplicationFilters = {}) => {
  const response = await apiClient.get<PaginatedResponse<BetaApplication>>(
    "/admin/beta/applications/email-pending",
    { params }
  );
  return response.data;
};

export const getEmailVerifiedApplications = async (params: ApplicationFilters = {}) => {
  const response = await apiClient.get<PaginatedResponse<BetaApplication>>(
    "/admin/beta/applications/email-verified",
    { params }
  );
  return response.data;
};

export const getRegistrationCompleteApplications = async (params: ApplicationFilters = {}) => {
  const response = await apiClient.get<PaginatedResponse<BetaApplication>>(
    "/admin/beta/applications/registration-complete",
    { params }
  );
  return response.data;
};

export const getApplicationsWithInvitationSent = async (params: ApplicationFilters = {}) => {
  const response = await apiClient.get<PaginatedResponse<BetaApplication>>(
    "/admin/beta/applications/invitation-sent",
    { params }
  );
  return response.data;
};

interface AwaitingInvitationResponse {
  success: boolean;
  count: number;
  data: BetaApplication[];
}

export const getApprovedAwaitingInvitation = async (): Promise<AwaitingInvitationResponse> => {
  const response = await apiClient.get<AwaitingInvitationResponse>(
    "/admin/beta/applications/awaiting-invitation"
  );
  return response.data;
};

export const getBetaApplicationById = async (
  applicationId: string
): Promise<ApiResponse<BetaApplication>> => {
  const response = await apiClient.get<ApiResponse<BetaApplication>>(
    `/admin/beta/applications/${applicationId}`
  );
  return response.data;
};

export interface ManualApplicationPayload {
  email: string;
  first_name: string;
  last_name: string;
  notes?: string;
  send_invitation?: boolean;
}

export interface ApplicationMutationResponse {
  success: boolean;
  message: string;
  email_sent?: boolean;
  status_updated?: boolean;
  email_error?: string;
  unchanged?: boolean;
  data?: BetaApplication;
}

export const manuallyAddApprovedBetaUser = async (
  payload: ManualApplicationPayload
): Promise<ApplicationMutationResponse> => {
  const response = await apiClient.post<ApplicationMutationResponse>(
    "/admin/beta/applications/manual",
    payload
  );
  return response.data;
};

interface UpdateStatusInput {
  applicationId: string;
  betaStatus: BetaStatus;
  reviewNotes?: string;
}

export const updateBetaApplicationStatus = async ({
  applicationId,
  betaStatus,
  reviewNotes,
}: UpdateStatusInput): Promise<ApplicationMutationResponse> => {
  const response = await apiClient.patch<ApplicationMutationResponse>(
    `/admin/beta/applications/${applicationId}/status`,
    {
      beta_status: betaStatus,
      review_notes: reviewNotes,
    }
  );
  return response.data;
};

interface ApproveApplicationInput {
  applicationId: string;
  reviewNotes?: string;
}

export const approveBetaApplication = async ({
  applicationId,
  reviewNotes,
}: ApproveApplicationInput): Promise<ApplicationMutationResponse> => {
  const response = await apiClient.post<ApplicationMutationResponse>(
    `/admin/beta/applications/${applicationId}/approve`,
    {
      review_notes: reviewNotes,
    }
  );
  return response.data;
};

export const resendBetaInvitation = async (
  applicationId: string
): Promise<ApplicationMutationResponse> => {
  const response = await apiClient.post<ApplicationMutationResponse>(
    `/admin/beta/applications/${applicationId}/resend-invitation`,
    {}
  );
  return response.data;
};
