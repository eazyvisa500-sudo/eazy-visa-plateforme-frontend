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
    numero_passport?: string;
    date_expiration_passport?: string;
    role?: 'MANAGER' | 'EMPLOYE' | 'CONSULTANT';
    civilite?: string;
    genre?: string;
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
    departementId: number;
    departement: { id: number; nom: string };
    poste: string;
    telephone: string;
    role: string;
    entrepriseId: number;
    createdAt: string;
  }[];
  forfait?: {
    nombre_user_autorise: number;
    nombre_user_actuel: number;
    places_restantes: number;
  };
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
  departementId: number;
  departement: string | { id: number; nom: string };
  poste: string;
  telephone: string;
  role: string;
  is_block: boolean;
  entrepriseId: number;
  entreprise?: { nom: string; identifiant: string };
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

// Employee Overview Types
export interface EmployeeOverview {
  employee: {
    id: number;
    prenom: string;
    nom: string;
    email: string;
    matricule: string;
    departementId: number;
    departement: { id: number; nom: string };
    poste: string;
    telephone: string;
    role: string;
    is_block: boolean;
    entrepriseId: number;
    entreprise: { id: number; nom: string; identifiant: string };
    civilite: string;
    genre: string;
    numero_passport: string;
    date_expiration_passport: string;
    createdAt: string;
    updatedAt: string;
  };
  budgetPersonnel: {
    id: number;
    reference: string;
    matricule: string;
    montant_alloue: number;
    montant_utilise: number;
    montant_restant: number;
    bloquer: boolean;
  };
  reservationBillets: Array<{
    id: number;
    numeroReservation: string;
    numeroOrder: string | null;
    statut: string;
    prix: number | null;
    devise: string;
  }>;
  reservationHotels: Array<{
    id: number;
    nomHotel: string | null;
    statut: string;
    prixTotal: number | null;
    devise: string;
  }>;
  demandesVoyage: Array<{
    id: number;
    depart: string;
    arrive: string;
    statut: string;
    dateDepart: string;
  }>;
  politique: {
    id: number;
    classe: string;
    hotel: string;
    politique: string;
  };
  auditBudgets: Array<{
    id: number;
    action: string;
    montant: number;
    montant_avant: number;
    montant_apres: number;
  }>;
  statistiques: {
    demandes: {
      total: number;
      approuvees: number;
      enCours: number;
      rejetees: number;
      annulees: number;
    };
    vols: {
      total: number;
      confirmes: number;
      enAttente: number;
      annules: number;
    };
    hotels: {
      total: number;
      confirmes: number;
      enAttente: number;
      annules: number;
    };
  };
}

export async function getEmployeeOverview(matricule: string): Promise<EmployeeOverview> {
  return apiFetch<EmployeeOverview>(`/employes/${matricule}/overview`);
}
