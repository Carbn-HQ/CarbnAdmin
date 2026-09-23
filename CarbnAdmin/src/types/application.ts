export type ApplicantStatus = "pending" | "approved" | "declined" | "active";

export interface ApplicationAnswer {
  id: string;
  label: string;
  value: string | number | null;
}

export interface BetaApplication {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  status: ApplicantStatus;
  review_notes: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  approved_at: string | null;
  declined_at: string | null;
  activated_at: string | null;
  last_login_at: string | null;
  auth_user_id: string | null;
  created_at: string;
  updated_at: string;
  application_details?: Record<string, string | number | null>;
  application_submitted_at?: string | null;
  application_answers?: ApplicationAnswer[];
}

export interface ApplicationFilters {
  page?: number;
  limit?: number;
  status?: ApplicantStatus;
  search?: string;
}

export interface BetaMetrics {
  total_applicants: number;
  pending: number;
  approved: number;
  declined: number;
  active: number;
}
