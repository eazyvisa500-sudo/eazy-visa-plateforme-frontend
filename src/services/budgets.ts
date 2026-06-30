import { apiFetch } from './api';

export interface BudgetAnnuel {
  id: number;
  reference: string;
  identifiant_entreprise: string;
  annee: number;
  date_debut: string;
  date_fin: string;
  budget: string;
  est_active: boolean;
  est_cloture: boolean;
  createdAt: string;
  entreprise?: { id: number; nom: string; identifiant: string };
  _count?: { budgetDepartements: number; budgetPersonnels: number };
}

export interface GetBudgetsResponse {
  total: number;
  budgets: BudgetAnnuel[];
}

export interface CreateBudgetPayload {
  identifiant_entreprise?: string;
  annee: number;
  date_debut: string;
  date_fin: string;
  budget: number;
}

export interface CreateBudgetResponse {
  message: string;
  budgetAnnuel: BudgetAnnuel;
}

export async function getBudgetsAnnuels(): Promise<GetBudgetsResponse> {
  return apiFetch<GetBudgetsResponse>('/budgets-annuels');
}

export async function createBudgetAnnuel(
  payload: CreateBudgetPayload
): Promise<CreateBudgetResponse> {
  return apiFetch<CreateBudgetResponse>('/budgets-annuels', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function activerBudgetAnnuel(id: number): Promise<{ message: string; budgetAnnuel: BudgetAnnuel }> {
  return apiFetch<{ message: string; budgetAnnuel: BudgetAnnuel }>(`/budgets-annuels/${id}/activer`, {
    method: 'PATCH',
  });
}

export async function cloturerBudgetAnnuel(id: number): Promise<{ message: string; budgetAnnuel: BudgetAnnuel }> {
  return apiFetch<{ message: string; budgetAnnuel: BudgetAnnuel }>(`/budgets-annuels/${id}/cloturer`, {
    method: 'PATCH',
  });
}

export async function updateBudgetAnnuel(
  id: number,
  payload: Partial<CreateBudgetPayload>
): Promise<{ message: string; budgetAnnuel: BudgetAnnuel }> {
  return apiFetch<{ message: string; budgetAnnuel: BudgetAnnuel }>(`/budgets-annuels/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteBudgetAnnuel(id: number): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/budgets-annuels/${id}`, {
    method: 'DELETE',
  });
}

// --- Allocation ---

export interface BudgetDepartement {
  id: number;
  reference: string;
  departementId: number;
  montant_alloue: string;
  montant_utilise: string;
  montant_restant: string;
  createdAt: string;
  departement?: { id: number; nom: string };
}

export interface BudgetPersonnel {
  id: number;
  reference: string;
  matricule: string;
  montant_alloue: string;
  montant_utilise: string;
  montant_restant: string;
  createdAt: string;
  user?: { id: number; prenom: string; nom: string; matricule: string; departement?: { id: number; nom: string } };
}

export interface GetBudgetDepartementsResponse {
  total: number;
  budgets: BudgetDepartement[];
}

export interface GetBudgetPersonnelsResponse {
  total: number;
  budgets: BudgetPersonnel[];
}

export async function allouerBudgetDepartement(
  reference: string,
  payload: { departementId: number; montant_alloue: number }
): Promise<{ message: string; budgetDepartement: BudgetDepartement }> {
  return apiFetch<{ message: string; budgetDepartement: BudgetDepartement }>(`/budgets-annuels/${reference}/departements`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function allouerBudgetPersonnel(
  reference: string,
  payload: { matricule: string; montant_alloue: number; departementId?: number }
): Promise<{ message: string; budgetPersonnel: BudgetPersonnel }> {
  return apiFetch<{ message: string; budgetPersonnel: BudgetPersonnel }>(`/budgets-annuels/${reference}/personnels`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getBudgetDepartements(reference: string): Promise<GetBudgetDepartementsResponse> {
  return apiFetch<GetBudgetDepartementsResponse>(`/budgets-annuels/${reference}/departements`);
}

export async function getBudgetPersonnels(reference: string): Promise<GetBudgetPersonnelsResponse> {
  return apiFetch<GetBudgetPersonnelsResponse>(`/budgets-annuels/${reference}/personnels`);
}
