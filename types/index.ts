export type RejectionStatus = "pending" | "rejected" | "accepted";

const VALID_STATUSES: ReadonlySet<string> = new Set([
  "pending",
  "rejected",
  "accepted",
]);

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
  const status =
    typeof raw.status === "string" && VALID_STATUSES.has(raw.status)
      ? (raw.status as RejectionStatus)
      : "rejected";

  return {
    id: String(raw.id ?? ""),
    user_id: String(raw.user_id ?? ""),
    title: String(raw.title ?? ""),
    description: raw.description != null ? String(raw.description) : null,
    image_url: raw.image_url != null ? String(raw.image_url) : null,
    date: String(raw.date ?? ""),
    status,
    created_at: String(raw.created_at ?? ""),
  };
}
