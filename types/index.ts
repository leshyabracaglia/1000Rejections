export const REJECTION_STATUS = {
  PENDING: "pending",
  REJECTED: "rejected",
  ACCEPTED: "accepted",
} as const;

export type IRejectionStatus = (typeof REJECTION_STATUS)[keyof typeof REJECTION_STATUS];

export interface IRejection {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  date: string;
  status: IRejectionStatus;
  created_at: string;
}
