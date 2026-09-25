export type ApplicantStatus = "pending" | "approved" | "declined" | "active";

export interface ApplicationAnswer {
  id: string;
  label: string;
  value: string | number | string[] | null;
}

export const APPLICATION_FORM_FIELDS: { id: string; label: string }[] = [
  { id: "full_name", label: "Full name" },
  { id: "gender", label: "Gender" },
  { id: "age", label: "Age" },
  { id: "location", label: "Location" },
  { id: "occupation", label: "Occupation" },
  { id: "experience_level", label: "Experience level" },
  { id: "preferred_activities", label: "Preferred activities" },
  { id: "primary_goal", label: "Primary goal" },
  { id: "help_needed", label: "What do you want help with?" },
  { id: "current_training", label: "How are you training and recovering now?" },
  { id: "why_carbn", label: "Why do you want to join the Founding Fifty?" },
  { id: "time_commitment", label: "Time you can give each week" },
  { id: "referral_source", label: "How did you hear about CARBN?" },
];

export const LONG_APPLICATION_FIELDS = [
  "preferred_activities",
  "help_needed",
  "current_training",
  "why_carbn",
];

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
  application_details?: Record<string, string | number | string[] | null>;
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
