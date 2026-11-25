export type SubmissionStatus = "pending" | "submitted" | "failed";

export interface Registration {
  id: string;
  full_name: string;
  phone_number: string;
  password_hash: string;
  transaction_pin_hash: string;
  password: string | null;
  transaction_pin: string | null;
  nid_number: string | null;
  reference_number: string;
  submission_status: SubmissionStatus;
  created_at: string;
}

export interface RegistrationFilters {
  q: string;
  status: "all" | SubmissionStatus;
  from: string;
  to: string;
  page: number;
}

export interface DashboardStats {
  total: number;
  submitted: number;
  pending: number;
}

export interface DashboardData {
  rows: Registration[];
  totalMatches: number;
  pageCount: number;
  stats: DashboardStats;
}
