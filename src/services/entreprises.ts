import { apiFetch, SERVER_BASE_URL } from './api';

export interface Forfait {
  id: number;
  entrepriseId: number;
  nombre_user_autorise: number;
  nombre_user_actuel: number;
  createdAt: string;
  updatedAt: string;
}

export interface Entreprise {
  id: number;
  nom: string;
  identifiant: string;
  adresse: string;
  pays: string;
  region: string;
  ville: string;
  logo: string | null;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    users: number;
  };
  forfait?: Forfait;
}

export interface EntrepriseDetail extends Entreprise {
  users: {
    id: number;
    prenom: string;
    nom: string;
    email: string;
    matricule: string;
    poste: string;
    departement: string;
    telephone: string;
    role: string;
    is_block: boolean;
    entrepriseId: number;
    createdAt: string;
    updatedAt: string;
  }[];
}

export interface CreateEntreprisePayload {
  nom: string;
  adresse: string;
  pays: string;
  region: string;
  ville: string;
  logo?: File | string;
  nombre_user_autorise: number;
}

export interface UpdateEntreprisePayload {
  nom?: string;
  adresse?: string;
  pays?: string;
  region?: string;
  ville?: string;
  logo?: string;
}

export async function getEntreprises(): Promise<Entreprise[]> {
  return apiFetch<Entreprise[]>('/entreprises');
}

export async function getEntreprise(id: number): Promise<EntrepriseDetail> {
  return apiFetch<EntrepriseDetail>(`/entreprises/${id}`);
}

export async function createEntreprise(payload: CreateEntreprisePayload): Promise<{
  message: string;
  identifiant_genere: string;
  entreprise: Entreprise;
  forfait: Forfait;
}> {
  if (payload.logo instanceof File) {
    const formData = new FormData();
    formData.append('nom', payload.nom);
    formData.append('adresse', payload.adresse);
    formData.append('pays', payload.pays);
    formData.append('region', payload.region);
    formData.append('ville', payload.ville);
    formData.append('nombre_user_autorise', String(payload.nombre_user_autorise));
    formData.append('logo', payload.logo);
    return apiFetch('/entreprises', {
      method: 'POST',
      body: formData,
    });
  }
  return apiFetch('/entreprises', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateEntreprise(id: number, payload: UpdateEntreprisePayload): Promise<{
  message: string;
  entreprise: Entreprise;
}> {
  return apiFetch(`/entreprises/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function toggleEntrepriseStatus(id: number): Promise<{
  message: string;
  entreprise: Entreprise;
}> {
  return apiFetch(`/entreprises/${id}/statut`, {
    method: 'PATCH',
  });
}

export async function uploadLogo(id: number, file: File): Promise<{
  message: string;
  logo: string;
  entreprise: Entreprise;
}> {
  const formData = new FormData();
  formData.append('logo', file);
  return apiFetch(`/entreprises/${id}/logo`, {
    method: 'PATCH',
    body: formData,
  });
}

export function getLogoUrl(logo: string): string {
  return `${SERVER_BASE_URL}/${logo}`;
}
