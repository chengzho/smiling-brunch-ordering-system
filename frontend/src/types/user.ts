export type UserRole = 'customer' | 'admin';
export type UserStatus = 'active' | 'inactive';

export type User = {
  user_id: number;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  created_at: string;
};
