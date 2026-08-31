import apiClient from "./apiClient";
import type { ApiResponse, PaginatedResponse } from "../types/api";
import type {
  ApplicationFilters,
  BetaApplication,
  BetaMetrics,
} from "../types/application";

export const getBetaDashboardMetrics = async (): Promise<ApiResponse<BetaMetrics>> => {
  const response = await apiClient.get<ApiResponse<BetaMetrics>>("/admin/overview");
  return response.data;
};

export const getBetaApplications = async (
  params: ApplicationFilters = {}
): Promise<PaginatedResponse<BetaApplication>> => {
  const response = await apiClient.get<PaginatedResponse<BetaApplication>>(
    "/admin/applicants",
    { params }
  );
  return response.data;
};

export const getBetaApplicationById = async (
  applicationId: string
): Promise<ApiResponse<BetaApplication>> => {
  const response = await apiClient.get<ApiResponse<BetaApplication>>(
    `/admin/applicants/${applicationId}`
  );
  return response.data;
};

export interface ApplicationMutationResponse {
  success: boolean;
  message: string;
  email_sent?: boolean;
  unchanged?: boolean;
  data?: BetaApplication;
}

interface ApproveApplicationInput {
  applicationId: string;
  reviewNotes?: string;
}

export const approveBetaApplication = async ({
  applicationId,
  reviewNotes,
}: ApproveApplicationInput): Promise<ApplicationMutationResponse> => {
  const response = await apiClient.post<ApplicationMutationResponse>(
    `/admin/applicants/${applicationId}/approve`,
    { review_notes: reviewNotes }
  );
  return response.data;
};

export const declineBetaApplication = async ({
  applicationId,
  reviewNotes,
}: ApproveApplicationInput): Promise<ApplicationMutationResponse> => {
  const response = await apiClient.post<ApplicationMutationResponse>(
    `/admin/applicants/${applicationId}/decline`,
    { review_notes: reviewNotes }
  );
  return response.data;
};

export const resendBetaInvitation = async (
  applicationId: string
): Promise<ApplicationMutationResponse> => {
  const response = await apiClient.post<ApplicationMutationResponse>(
    `/admin/applicants/${applicationId}/resend-invite`,
    {}
  );
  return response.data;
};
