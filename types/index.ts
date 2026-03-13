export type RejectionStatus = "pending" | "rejected" | "accepted";

export interface Rejection {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  date: string;
  status: RejectionStatus;
  created_at: string;
}

export function normalizeRejection(raw: Record<string, unknown>): Rejection {
  return { ...(raw as Rejection), status: (raw.status as RejectionStatus) ?? "rejected" };
}

export interface CreateRejectionInput {
  title: string;
  description?: string;
  image_url?: string;
  date: string;
  status?: RejectionStatus;
}

export interface UpdateRejectionInput {
  title?: string;
  description?: string;
  image_url?: string | null;
  date?: string;
  status?: RejectionStatus;
}
