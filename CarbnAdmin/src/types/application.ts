export type RegistrationStatus =
  | "email_pending"
  | "email_verified"
  | "registration_complete";

export type BetaStatus =
  | "pending_review"
  | "approved"
  | "invited"
  | "active"
  | "declined"
  | "suspended"
  | "completed";

export interface ApplicationActivity {
  id: string;
  action: string;
  previous_status: string | null;
  new_status: string | null;
  performed_by: string | null;
  notes: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface BetaApplication {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  registration_status: RegistrationStatus;
  beta_status: BetaStatus;
  source: string | null;
  campaign: string | null;
  metadata: Record<string, unknown>;
  review_notes: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  email_verified_at: string | null;
  registration_completed_at: string | null;
  approved_at: string | null;
  invited_at: string | null;
  activated_at: string | null;
  declined_at: string | null;
  suspended_at: string | null;
  completed_at: string | null;
  auth_user_id: string | null;
  created_at: string;
  updated_at: string;
  activity?: ApplicationActivity[];
}

export interface ApplicationFilters {
  page?: number;
  limit?: number;
  beta_status?: BetaStatus;
  registration_status?: RegistrationStatus;
  source?: string;
  campaign?: string;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
}

export interface BetaMetrics {
  total_applications: number;

  registration: {
    email_pending: number;
    email_verified: number;
    registration_complete: number;
  };

  beta: {
    pending_review: number;
    approved: number;
    invited: number;
    active: number;
    declined: number;
    suspended: number;
    completed: number;
  };

  invitations_sent: number;
  active_beta_members: number;
  approval_rate: number;
  activation_rate: number;
}
