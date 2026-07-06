import { apiFetch } from './api';

export interface DashboardOverview {
  entreprise: {
    totalEmployes: number;
    totalDepartements: number;
  };
  demandesVoyage: {
    total: number;
    parStatut: Array<{ statut: string; count: number }>;
    dernieres: any[];
  };
  reservations: {
    billets: {
      total: number;
      parStatut: Array<{ statut: string; count: number }>;
    };
    hotels: {
      total: number;
      parStatut: Array<{ statut: string; count: number }>;
    };
    dernieres: any[];
  };
  budget: {
    annuel: {
      annee: number;
      budget: number;
      montant_restant: number;
      nombreBudgets: number;
      details: Array<{
        reference: string;
        budget: number;
        montant_restant: number;
        est_active: boolean;
        est_cloture: boolean;
      }>;
    };
    departements: {
      total: number;
      totalAlloue: number;
      totalUtilise: number;
      totalRestant: number;
      details: any[];
    };
    personnels: {
      total: number;
      totalAlloue: number;
      totalUtilise: number;
      totalRestant: number;
      details: any[];
    };
  };
}

export async function getDashboardOverview(annee?: number): Promise<DashboardOverview> {
  const query = annee ? `?annee=${annee}` : '';
  return apiFetch<DashboardOverview>(`/dashboard/overview${query}`);
}

export interface DashboardDetails {
  entreprise: {
    employes: any[];
    departements: Array<{ id: number; nom: string; nombreEmployes: number }>;
  };
  demandesVoyage: any[];
  reservations: {
    billets: any[];
    hotels: any[];
  };
  budget: {
    annuel: {
      annee: number;
      budget: number;
      montant_restant: number;
      nombreBudgets: number;
      details: Array<{
        id: number;
        reference: string;
        identifiant_entreprise: string;
        annee: number;
        budget: number;
        montant_restant: number;
        est_active: boolean;
        est_cloture: boolean;
        date_debut: string;
        date_fin: string;
        createdAt: string;
      }>;
    };
    departements: any[];
    personnels: any[];
    audit: any[];
  };
}

export async function getDashboardDetails(annee?: number): Promise<DashboardDetails> {
  const query = annee ? `?annee=${annee}` : '';
  return apiFetch<DashboardDetails>(`/dashboard/details${query}`);
}
