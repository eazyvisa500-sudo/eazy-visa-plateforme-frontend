import { apiFetch } from './api';

export interface BudgetAnnuel {
  id: number;
  reference: string;
  identifiant_entreprise: string;
  annee: number;
  date_debut: string;
  date_fin: string;
  budget: string;
  montant_restant?: string;
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

export async function getBudgetsAnnuels(params?: { identifiant_entreprise?: string }): Promise<GetBudgetsResponse> {
  const query = new URLSearchParams();
  if (params?.identifiant_entreprise) query.set('identifiant_entreprise', params.identifiant_entreprise);
  const qs = query.toString();
  return apiFetch<GetBudgetsResponse>(`/budgets-annuels${qs ? `?${qs}` : ''}`);
}

export async function getBudgetsByEntreprise(identifiant: string): Promise<GetBudgetsResponse> {
  return apiFetch<GetBudgetsResponse>(`/budgets-annuels/entreprise/${identifiant}`);
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
  bloquer: boolean;
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
  bloquer: boolean;
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

// --- Augmenter / Diminuer ---

export async function augmenterBudgetAnnuel(reference: string, payload: { montant: number }): Promise<{ message: string; budgetAnnuel: BudgetAnnuel }> {
  return apiFetch<{ message: string; budgetAnnuel: BudgetAnnuel }>(`/budgets-annuels/${reference}/augmenter`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function diminuerBudgetAnnuel(reference: string, payload: { montant: number }): Promise<{ message: string; budgetAnnuel: BudgetAnnuel }> {
  return apiFetch<{ message: string; budgetAnnuel: BudgetAnnuel }>(`/budgets-annuels/${reference}/diminuer`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function augmenterBudgetDepartement(id: number, payload: { montant: number }): Promise<{ message: string; budgetDepartement: BudgetDepartement }> {
  return apiFetch<{ message: string; budgetDepartement: BudgetDepartement }>(`/budgets-annuels/departements/${id}/augmenter`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function diminuerBudgetDepartement(id: number, payload: { montant: number }): Promise<{ message: string; budgetDepartement: BudgetDepartement }> {
  return apiFetch<{ message: string; budgetDepartement: BudgetDepartement }>(`/budgets-annuels/departements/${id}/diminuer`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function augmenterBudgetPersonnel(id: number, payload: { montant: number }): Promise<{ message: string; budgetPersonnel: BudgetPersonnel }> {
  return apiFetch<{ message: string; budgetPersonnel: BudgetPersonnel }>(`/budgets-annuels/personnels/${id}/augmenter`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function diminuerBudgetPersonnel(id: number, payload: { montant: number }): Promise<{ message: string; budgetPersonnel: BudgetPersonnel }> {
  return apiFetch<{ message: string; budgetPersonnel: BudgetPersonnel }>(`/budgets-annuels/personnels/${id}/diminuer`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// --- Bloquer / Débloquer ---

export async function bloquerBudgetDepartement(id: number): Promise<{ message: string; budgetDepartement: BudgetDepartement }> {
  return apiFetch<{ message: string; budgetDepartement: BudgetDepartement }>(`/budgets-annuels/departements/${id}/bloquer`, { method: 'PATCH' });
}

export async function debloquerBudgetDepartement(id: number): Promise<{ message: string; budgetDepartement: BudgetDepartement }> {
  return apiFetch<{ message: string; budgetDepartement: BudgetDepartement }>(`/budgets-annuels/departements/${id}/debloquer`, { method: 'PATCH' });
}

export async function bloquerBudgetPersonnel(id: number): Promise<{ message: string; budgetPersonnel: BudgetPersonnel }> {
  return apiFetch<{ message: string; budgetPersonnel: BudgetPersonnel }>(`/budgets-annuels/personnels/${id}/bloquer`, { method: 'PATCH' });
}

export async function debloquerBudgetPersonnel(id: number): Promise<{ message: string; budgetPersonnel: BudgetPersonnel }> {
  return apiFetch<{ message: string; budgetPersonnel: BudgetPersonnel }>(`/budgets-annuels/personnels/${id}/debloquer`, { method: 'PATCH' });
}

// --- Audits ---

export interface BudgetAudit {
  id: number;
  reference: string;
  entrepriseId: number;
  action: string;
  type_source: string;
  type_destination: string;
  montant: string;
  montant_avant: string;
  montant_apres: string;
  description: string;
  effectue_par: string;
  effectue_par_id: number;
  role_effectue_par: string;
  target_id: number | null;
  target_matricule: string | null;
  createdAt: string;
}

export interface GetBudgetAuditsResponse {
  total: number;
  page: number;
  limit: number;
  audits: BudgetAudit[];
}

export async function getBudgetAudits(params?: { reference?: string; action?: string; role_effectue_par?: string; page?: number; limit?: number }): Promise<GetBudgetAuditsResponse> {
  const query = new URLSearchParams();
  if (params?.reference) query.set('reference', params.reference);
  if (params?.action) query.set('action', params.action);
  if (params?.role_effectue_par) query.set('role_effectue_par', params.role_effectue_par);
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  const qs = query.toString();
  return apiFetch<GetBudgetAuditsResponse>(`/budgets-annuels/audits${qs ? `?${qs}` : ''}`);
}

export interface GetBudgetAuditsByEmployeeResponse {
  total: number;
  page: number;
  limit: number;
  employe: {
    id: number;
    prenom: string;
    nom: string;
    matricule: string;
    role: string;
  };
  audits: BudgetAudit[];
}

export async function getBudgetAuditsByEmployee(matricule: string, params?: { page?: number; limit?: number }): Promise<GetBudgetAuditsByEmployeeResponse> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  const qs = query.toString();
  return apiFetch<GetBudgetAuditsByEmployeeResponse>(`/budgets-allocation/audits/employe/${matricule}${qs ? `?${qs}` : ''}`);
}

export interface BudgetAnnuelLite {
  reference: string;
  annee: number;
  date_debut: string;
  date_fin: string;
  budget: string;
  identifiant_entreprise: string;
  est_active: boolean;
  est_cloture: boolean;
}

export interface MesBudget {
  id: number;
  reference: string;
  matricule: string;
  montant_alloue: string;
  montant_utilise: string;
  montant_restant: string;
  bloquer: boolean;
  createdAt: string;
  budgetAnnuel: BudgetAnnuelLite;
}

export interface GetMesBudgetsResponse {
  total: number;
  employe: {
    id: number;
    prenom: string;
    nom: string;
    matricule: string;
    role: string;
  };
  budgets: MesBudget[];
}

export async function getMesBudgets(): Promise<GetMesBudgetsResponse> {
  return apiFetch<GetMesBudgetsResponse>('/budgets-allocation/mes-budgets');
}

export async function getEmployeeBudgets(matricule: string): Promise<GetMesBudgetsResponse> {
  return apiFetch<GetMesBudgetsResponse>(`/budgets-allocation/employe/${matricule}/budgets`);
}
