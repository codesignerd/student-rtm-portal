export type UserRole = 'admin' | 'student';

export type AuthUser = {
  id: string;
  email: string | null;
  role: UserRole | null;
  status: 'active' | 'inactive';
};
