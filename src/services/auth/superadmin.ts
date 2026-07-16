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
  console.log("adminEmail",credentials.email,"adminPassword",credentials.mot_de_passe);
  return apiFetch<SuperAdminLoginResponse>('/auth/login/superadmin', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}
