import type { UserLoginResponse } from './common';

export function saveToken(token: string): void {
  localStorage.setItem('token', token);
}

export function getToken(): string | null {
  return localStorage.getItem('token');
}

export function removeToken(): void {
  localStorage.removeItem('token');
}

export function saveUser(user: UserLoginResponse['user']): void {
  localStorage.setItem('user', JSON.stringify(user));
}

export function getUser(): UserLoginResponse['user'] | null {
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserLoginResponse['user'];
  } catch {
    return null;
  }
}

export function removeUser(): void {
  localStorage.removeItem('user');
}

export function logout(): void {
  removeToken();
  removeUser();
}

export function getRedirectPath(role: string): string {
  switch (role) {
    case 'SUPERADMIN':
      return '/superadmin';
    case 'MANAGER':
      return '/admin';
    case 'EMPLOYE':
    case 'CONSULTANT':
      return '/employer';
    default:
      return '/connexion';
  }
}
