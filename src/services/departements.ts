import { apiFetch } from './api';

export interface Departement {
  id: number;
  nom: string;
  entrepriseId: number;
  _count: {
    users: number;
  };
}

export interface GetDepartementsResponse {
  total: number;
  departements: Departement[];
}

export async function getDepartements(entrepriseId: number): Promise<GetDepartementsResponse> {
  return apiFetch<GetDepartementsResponse>(`/departements?entrepriseId=${entrepriseId}`);
}

export async function getDepartementsMonEntreprise(): Promise<GetDepartementsResponse> {
  return apiFetch<GetDepartementsResponse>('/departements/mon-entreprise');
}

export interface CreateDepartementPayload {
  nom: string;
  entrepriseId: number;
}

export interface CreateDepartementResponse {
  message: string;
  departement: Departement;
}

export async function createDepartement(payload: CreateDepartementPayload): Promise<CreateDepartementResponse> {
  return apiFetch<CreateDepartementResponse>('/departements', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
