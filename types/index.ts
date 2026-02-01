export interface Rejection {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  date: string;
  created_at: string;
}

export interface CreateRejectionInput {
  title: string;
  description?: string;
  image_url?: string;
  date: string;
}

export interface UpdateRejectionInput {
  title?: string;
  description?: string;
  image_url?: string | null;
  date?: string;
}
