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
