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
