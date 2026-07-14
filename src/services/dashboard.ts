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

export interface GlobalAnalytics {
  annee: number;
  entreprises: {
    total: number;
    actives: number;
    inactives: number;
    topEmployes: Array<{
      id: number;
      nom: string;
      identifiant: string;
      is_active: boolean;
      totalEmployes: number;
      totalDepartements: number;
      totalDemandesVoyage: number;
      forfait: {
        nombre_user_autorise: number;
        nombre_user_actuel: number;
      };
    }>;
    topDemandes: any[];
    details: any[];
  };
  utilisateurs: {
    total: number;
    managers: number;
    employes: number;
    consultants: number;
    bloques: number;
  };
  departements: {
    total: number;
  };
  demandesVoyage: {
    total: number;
    parStatut: Array<{ statut: string; count: number }>;
    mensuelles: Array<{ mois: number; count: number }>;
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
  };
  budget: {
    annuel: {
      total: number;
      montant_restant: number;
      nombreBudgets: number;
      actifs: number;
      clotures: number;
    };
    departements: {
      total: number;
      totalAlloue: number;
      totalUtilise: number;
      totalRestant: number;
      bloques: number;
    };
    personnels: {
      total: number;
      totalAlloue: number;
      totalUtilise: number;
      totalRestant: number;
      bloques: number;
    };
  };
}

export async function getGlobalAnalytics(annee?: number): Promise<GlobalAnalytics> {
  const query = annee ? `?annee=${annee}` : '';
  return apiFetch<GlobalAnalytics>(`/dashboard/global-analytics${query}`);
}
