import { apiFetch } from './api';

export interface Departement {
  id: number;
  nom: string;
  entrepriseId: number;
  _count?: {
    users: number;
  };
}

export interface CreateDepartementPayload {
  nom: string;
  entrepriseId: number;
}

export interface CreateDepartementResponse {
  message: string;
  departement: Departement;
}

export interface GetDepartementsResponse {
  total: number;
  departements: Departement[];
}

export async function createDepartement(payload: CreateDepartementPayload): Promise<CreateDepartementResponse> {
  return apiFetch<CreateDepartementResponse>('/departements', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getDepartementsMonEntreprise(): Promise<GetDepartementsResponse> {
  return apiFetch<GetDepartementsResponse>('/departements/mon-entreprise');
}

export async function getDepartementsByEntreprise(entrepriseId: number): Promise<GetDepartementsResponse> {
  return apiFetch<GetDepartementsResponse>(`/departements?entrepriseId=${entrepriseId}`);
}

export async function updateDepartement(id: number, payload: { nom: string }): Promise<{ message: string; departement: Departement }> {
  return apiFetch<{ message: string; departement: Departement }>(`/departements/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteDepartement(id: number): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/departements/${id}`, {
    method: 'DELETE',
  });
}
