import { apiFetch } from './api';

export interface Forfait {
  id: number;
  entrepriseId: number;
  nombre_user_autorise: number;
  nombre_user_actuel: number;
  createdAt: string;
  updatedAt: string;
  entreprise?: {
    id: number;
    nom: string;
    identifiant: string;
  };
}

export async function getMonForfait(): Promise<Forfait> {
  return apiFetch<Forfait>('/forfaits/mon-forfait');
}

export async function augmenterForfait(
  id: number,
  amount?: number,
): Promise<{ message: string; forfait: Forfait }> {
  return apiFetch<{ message: string; forfait: Forfait }>(`/forfaits/${id}/augmenter`, {
    method: 'PATCH',
    body: JSON.stringify(amount !== undefined ? { amount } : {}),
  });
}
