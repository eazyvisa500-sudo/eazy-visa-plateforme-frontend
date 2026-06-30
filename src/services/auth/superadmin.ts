import { apiFetch } from '../api';

export interface SuperAdminLoginResponse {
  message: string;
  token: string;
  superadmin: {
    email: string;
    role: string;
  };
}

export async function loginSuperAdmin(credentials: {
  email: string;
  mot_de_passe: string;
}): Promise<SuperAdminLoginResponse> {
  return apiFetch<SuperAdminLoginResponse>('/auth/login/superadmin', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}
