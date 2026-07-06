import { apiFetch } from './api';

export interface Politique {
  id: number;
  matricule: string;
  y: boolean;
  w: boolean;
  j: boolean;
  f: boolean;
  hotel: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    prenom: string;
    nom: string;
    matricule: string;
    role: string;
    entrepriseId: number;
  } | null;
}

export interface GetPolitiquesResponse {
  total: number;
  politiques: Politique[];
}

export interface CreatePolitiquePayload {
  matricule: string;
  y?: boolean;
  w?: boolean;
  j?: boolean;
  f?: boolean;
  hotel?: number;
}

export interface CreatePolitiqueResponse {
  message: string;
  politique: Politique;
}

export interface UpdatePolitiquePayload {
  y?: boolean;
  w?: boolean;
  j?: boolean;
  f?: boolean;
  hotel?: number;
}

export interface UpdatePolitiqueResponse {
  message: string;
  politique: Politique;
}

export async function getPolitiques(): Promise<GetPolitiquesResponse> {
  return apiFetch<GetPolitiquesResponse>('/politiques');
}

export async function getPolitique(matricule: string): Promise<{ politique: Politique }> {
  return apiFetch<{ politique: Politique }>(`/politiques/${matricule}`);
}

export async function createPolitique(payload: CreatePolitiquePayload): Promise<CreatePolitiqueResponse> {
  return apiFetch<CreatePolitiqueResponse>('/politiques', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updatePolitique(matricule: string, payload: UpdatePolitiquePayload): Promise<UpdatePolitiqueResponse> {
  return apiFetch<UpdatePolitiqueResponse>(`/politiques/${matricule}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deletePolitique(matricule: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/politiques/${matricule}`, {
    method: 'DELETE',
  });
}
