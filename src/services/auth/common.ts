import { apiFetch } from '../api';

export interface UserLoginResponse {
  message: string;
  token: string;
  user: {
    id: number;
    email: string;
    prenom: string;
    nom: string;
    role: 'SUPERADMIN' | 'MANAGER' | 'EMPLOYE' | 'CONSULTANT';
    entrepriseId?: number;
  };
}

export async function loginUser(credentials: {
  email: string;
  mot_de_passe: string;
}): Promise<UserLoginResponse> {
  return apiFetch<UserLoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}
