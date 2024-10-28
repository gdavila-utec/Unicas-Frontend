// types/junta.ts
export interface User {
  id: string;
  name?: string;
  email?: string;
  phone_number?: string;
  role?: string;
  username?: string;
}

export interface Junta {
  id: number;
  name: string;
  description: string;
  date: string;
  total_shares: number;
  share_value: number;
  duration_months: number;
  current_month: number;
  members: string[];
  // Add other junta properties as needed
}

export type ViewType = 'member' | 'admin' | 'facilitador' | 'user' | null;

// types/junta.ts
export interface DeleteJuntaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

// ... rest of your types
