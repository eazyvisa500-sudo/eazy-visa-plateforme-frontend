import { apiFetch } from './api';

export interface CreateEmployePayload {
  entrepriseId: number;
  employes: {
    prenom: string;
    nom: string;
    email: string;
    departement: string;
    poste: string;
    telephone: string;
    mot_de_passe: string;
    role?: 'MANAGER' | 'EMPLOYE' | 'CONSULTANT';
  }[];
}

export interface CreateEmployeResponse {
  message: string;
  total_demande: number;
  total_cree: number;
  ignores: number;
  employes: {
    id: number;
    prenom: string;
    nom: string;
    email: string;
    matricule: string;
    departement: string;
    poste: string;
    telephone: string;
    role: string;
    entrepriseId: number;
    createdAt: string;
  }[];
}

export async function createEmployes(payload: CreateEmployePayload): Promise<CreateEmployeResponse> {
  return apiFetch<CreateEmployeResponse>('/employes', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export interface Employe {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  matricule: string;
  departement: string;
  poste: string;
  telephone: string;
  role: string;
  is_block: boolean;
  entrepriseId: number;
  createdAt: string;
  updatedAt: string;
}

export interface GetEmployesResponse {
  total: number;
  employes: Employe[];
}

export async function getEmployes(): Promise<GetEmployesResponse> {
  return apiFetch<GetEmployesResponse>('/employes');
}

export async function getEmploye(id: number): Promise<Employe> {
  return apiFetch<Employe>(`/employes/${id}`);
}

export interface UpdateEmployePayload {
  prenom?: string;
  nom?: string;
  email?: string;
  departement?: string;
  poste?: string;
  telephone?: string;
  role?: 'EMPLOYE' | 'MANAGER' | 'CONSULTANT';
  mot_de_passe?: string;
}

export async function updateEmploye(id: number, payload: UpdateEmployePayload): Promise<{ message: string; employe: Employe }> {
  return apiFetch<{ message: string; employe: Employe }>(`/employes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function toggleBlockEmploye(id: number): Promise<{ message: string; employe: Employe }> {
  return apiFetch<{ message: string; employe: Employe }>(`/employes/${id}/bloquer`, {
    method: 'PATCH',
  });
}

export async function deleteEmploye(id: number): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/employes/${id}`, {
    method: 'DELETE',
  });
}
