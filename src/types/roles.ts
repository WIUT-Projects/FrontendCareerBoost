export type UserRole = 'jobseeker' | 'hr_expert' | 'admin';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}
