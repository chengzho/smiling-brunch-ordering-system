import { apiRequest } from './apiRequest';
import type { User } from '../types/user';

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  phone?: string;
};

export function apiGetMe(): Promise<User> {
  return apiRequest<User>('/auth/me.php');
}

export function apiLogin(email: string, password: string): Promise<User> {
  return apiRequest<User>('/auth/login.php', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function apiRegister(data: RegisterInput): Promise<null> {
  return apiRequest<null>('/auth/register.php', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function apiLogout(): Promise<null> {
  return apiRequest<null>('/auth/logout.php', {
    method: 'POST',
  });
}

export type UpdateProfileInput = {
  name: string;
  email: string;
  phone?: string;
};

export function apiUpdateProfile(data: UpdateProfileInput): Promise<User> {
  return apiRequest<User>('/auth/profile.php', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
