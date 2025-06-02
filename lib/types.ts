export interface User {
  id: number;
  email: string;
  password_hash: string;
  created_at: string;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  user_id: number;
  is_archived: boolean;
  is_shared: boolean;
  share_token?: string;
  labels: string[];
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Label {
  id: number;
  name: string;
  user_id: number;
  created_at: string;
}

export interface SharedNote {
  id: number;
  note_id: number;
  shared_with_email: string;
  permission: 'view' | 'edit';
  created_at: string;
}

export interface CreateNoteRequest {
  title?: string;
  content: string;
  labels?: string[];
  is_shared?: boolean;
}

export interface UpdateNoteRequest {
  title?: string;
  content?: string;
  is_archived?: boolean;
  is_shared?: boolean;
  share_token?: string;
  labels?: string[];
} 