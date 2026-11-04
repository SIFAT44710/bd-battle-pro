export type UserRole = 'player' | 'admin' | 'moderator';

export interface UserProfile {
  id: string;
  full_name: string;
  ign: string; // Free Fire In-Game Name
  ff_uid: string; // Free Fire UID (e.g., 2948201948)
  role: UserRole;
  demo_balance: number; // In BDT ৳
  avatar_url?: string;
  phone?: string;
  created_at: string;
}

export interface DemoAccount {
  id: string;
  email: string;
  profile: UserProfile;
  description: string;
}
