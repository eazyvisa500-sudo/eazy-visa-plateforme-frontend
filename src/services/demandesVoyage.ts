import { apiFetch } from './api';

export interface DemandeVoyage {
  id: number;
  matricule: string;
  identifiant_entreprise: string;
  depart: string;
  arrive: string;
  ville?: string;
  pays?: string;
  etat?: string;
  region?: string;
  allerRetour: boolean;
  dateDepart: string;
  dateRetour?: string | null;
  classe: string;
  motif: string;
  hotel?: string;
  statut: 'EN_ATTENTE' | 'APPROUVEE' | 'REJETEE' | 'ANNULEE' | 'TERMINEE' | 'EN_COURS';
  commentaire?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    prenom: string;
    nom: string;
    matricule: string;
    role: string;
  };
  entreprise?: {
    id: number;
    nom: string;
    identifiant: string;
  };
}

export interface CreateDemandePayload {
  depart: string;
  arrive: string;
  ville?: string;
  pays?: string;
  etat?: string;
  region?: string;
  allerRetour: boolean;
  dateDepart: string;
  dateRetour?: string;
  classe: string;
  hotel?: string;
  motif: string;
}

export interface CreateDemandeResponse {
  message: string;
  demande: DemandeVoyage;
}

export interface UpdateDemandePayload {
  depart?: string;
  arrive?: string;
  ville?: string;
  pays?: string;
  etat?: string;
  region?: string;
  allerRetour?: boolean;
  dateDepart?: string;
  dateRetour?: string;
  classe?: string;
  hotel?: string;
  motif?: string;
}

export interface UpdateDemandeResponse {
  message: string;
  demande: DemandeVoyage;
}

export interface GetMesDemandesResponse {
  total: number;
  demandes: DemandeVoyage[];
}

export interface GetAllDemandesResponse {
  total: number;
  demandes: DemandeVoyage[];
}

export interface GetDemandeResponse {
  demande: DemandeVoyage;
}

export interface PatchDemandeResponse {
  message: string;
  demande: DemandeVoyage;
}

export async function createDemandeVoyage(payload: CreateDemandePayload): Promise<CreateDemandeResponse> {
  return apiFetch<CreateDemandeResponse>('/demandes-voyage', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getMesDemandesVoyage(): Promise<GetMesDemandesResponse> {
  return apiFetch<GetMesDemandesResponse>('/demandes-voyage/mes-demandes');
}

export async function getAllDemandesVoyage(): Promise<GetAllDemandesResponse> {
  return apiFetch<GetAllDemandesResponse>('/demandes-voyage');
}

export async function getDemandeVoyage(id: number): Promise<GetDemandeResponse> {
  return apiFetch<GetDemandeResponse>(`/demandes-voyage/${id}`);
}

export async function updateDemandeVoyage(id: number, payload: UpdateDemandePayload): Promise<UpdateDemandeResponse> {
  return apiFetch<UpdateDemandeResponse>(`/demandes-voyage/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function approuverDemandeVoyage(id: number, commentaire?: string): Promise<PatchDemandeResponse> {
  return apiFetch<PatchDemandeResponse>(`/demandes-voyage/${id}/approuver`, {
    method: 'PATCH',
    body: JSON.stringify(commentaire ? { commentaire } : {}),
  });
}

export async function rejeterDemandeVoyage(id: number, commentaire?: string): Promise<PatchDemandeResponse> {
  return apiFetch<PatchDemandeResponse>(`/demandes-voyage/${id}/rejeter`, {
    method: 'PATCH',
    body: JSON.stringify(commentaire ? { commentaire } : {}),
  });
}

export async function annulerDemandeVoyage(id: number): Promise<PatchDemandeResponse> {
  return apiFetch<PatchDemandeResponse>(`/demandes-voyage/${id}/annuler`, {
    method: 'PATCH',
  });
}

export async function cloturerDemandeVoyage(id: number): Promise<PatchDemandeResponse> {
  return apiFetch<PatchDemandeResponse>(`/demandes-voyage/${id}/cloturer`, {
    method: 'PATCH',
  });
}
