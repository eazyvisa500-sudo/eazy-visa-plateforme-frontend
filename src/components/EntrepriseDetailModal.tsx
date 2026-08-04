import { useCallback, useEffect, useState } from 'react';
import {
  X, Building2, CheckCircle2, Lock, Users, Loader2, UserPlus, Plus, Trash2,
  Pencil, Ban, AlertTriangle, User, Wallet, Plane, Building, Eye, Unlock
} from 'lucide-react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from './Modal';
import {
  createEmployes,
  updateEmploye,
  deleteEmploye,
  toggleBlockEmploye,
  type Employe,
} from '../services/employes';
import {
  getDepartements,
  createDepartement,
  type Departement,
} from '../services/departements';
import type { EntrepriseDetail } from '../services/entreprises';
import { getBudgetsByEntreprise, type BudgetAnnuel } from '../services/budgets';
import { getPolitiques, type Politique } from '../services/politiques';

interface Props {
  detail?: EntrepriseDetail | null;
  loading?: boolean;
  onClose?: () => void;
  onRefresh?: () => void;
  asPage?: boolean;
}

interface EmpRow {
  prenom: string;
  nom: string;
  email: string;
  departement: string;
  poste: string;
  telephone: string;
  mot_de_passe: string;
  role: 'EMPLOYE' | 'MANAGER' | 'CONSULTANT';
  civilite?: string;
  genre?: string;
  numero_passport?: string;
  date_expiration_passport?: string;
}

function defaultEmp(): EmpRow {
  return {
    prenom: '',
    nom: '',
    email: '',
    departement: '',
    poste: '',
    telephone: '',
    mot_de_passe: '',
    role: 'EMPLOYE',
    civilite: '',
    genre: '',
    numero_passport: '',
    date_expiration_passport: '',
  };
}

export default function EntrepriseDetailModal({ detail, loading, onClose, onRefresh, asPage }: Props) {
  const [showCreateEmp, setShowCreateEmp] = useState(false);

  const [empRows, setEmpRows] = useState<EmpRow[]>([defaultEmp()]);
  const [empLoading, setEmpLoading] = useState(false);
  const [empError, setEmpError] = useState('');
  const [empSuccess, setEmpSuccess] = useState<string | null>(null);
  const [empErrors, setEmpErrors] = useState<Record<string, string>[]>([]);

  // Départements de l'entreprise (pour création employés et section départements)
  const [depts, setDepts] = useState<Departement[]>([]);
  const [deptsLoading, setDeptsLoading] = useState(false);

  // Création de département
  const [showCreateDept, setShowCreateDept] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [createDeptLoading, setCreateDeptLoading] = useState(false);
  const [createDeptError, setCreateDeptError] = useState('');

  // Actions employé
  const [selectedEmploye, setSelectedEmploye] = useState<Employe | null>(null);
  const [showEmpDetail, setShowEmpDetail] = useState(false);
  const [showEmpEdit, setShowEmpEdit] = useState(false);
  const [showEmpDelete, setShowEmpDelete] = useState(false);
  const [empActionLoading, setEmpActionLoading] = useState(false);
  const [empActionError, setEmpActionError] = useState('');

  // Édition employé
  const [editEmpPrenom, setEditEmpPrenom] = useState('');
  const [editEmpNom, setEditEmpNom] = useState('');
  const [editEmpEmail, setEditEmpEmail] = useState('');
  const [editEmpDepartement, setEditEmpDepartement] = useState('');
  const [editEmpPoste, setEditEmpPoste] = useState('');
  const [editEmpTelephone, setEditEmpTelephone] = useState('');
  const [editEmpRole, setEditEmpRole] = useState<'EMPLOYE' | 'MANAGER' | 'CONSULTANT'>('EMPLOYE');

  // Sections / onglets
  const [activeTab, setActiveTab] = useState<'details' | 'employes' | 'departements' | 'budget' | 'politique'>('details');

  // Budgets
  const [budgets, setBudgets] = useState<BudgetAnnuel[]>([]);
  const [budgetsLoading, setBudgetsLoading] = useState(false);

  // Politiques
  const [politiques, setPolitiques] = useState<Politique[]>([]);
  const [politiquesLoading, setPolitiquesLoading] = useState(false);

  function updateRow(index: number, patch: Partial<EmpRow>) {
    setEmpRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
    setEmpErrors((prev) => {
      const next = [...prev];
      const rowErr = { ...(next[index] || {}) };
      Object.keys(patch).forEach((key) => delete rowErr[key]);
      next[index] = rowErr;
      return next;
    });
  }

  function addRow() {
    setEmpRows((prev) => [...prev, defaultEmp()]);
  }

  function removeRow(index: number) {
    setEmpRows((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  }

  function isRowEmpty(row: EmpRow) {
    return (
      !row.prenom.trim() &&
      !row.nom.trim() &&
      !row.email.trim() &&
      !row.telephone.trim() &&
      !row.departement.trim() &&
      !row.poste.trim() &&
      !row.mot_de_passe.trim() &&
      !row.civilite &&
      !row.genre
    );
  }

  function validateRows(): {
    valid: boolean;
    errors: Record<string, string>[];
    validRows: EmpRow[];
  } {
    const errors: Record<string, string>[] = empRows.map(() => ({}));
    let allValid = true;

    for (let i = 0; i < empRows.length; i++) {
      const row = empRows[i];
      if (isRowEmpty(row)) continue;

      const err: Record<string, string> = {};
      if (!row.prenom.trim()) err.prenom = 'Prénom requis';
      if (!row.nom.trim()) err.nom = 'Nom requis';
      if (!row.email.trim()) err.email = 'Email requis';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) err.email = 'Email invalide';
      if (!row.telephone.trim()) err.telephone = 'Téléphone requis';
      if (!row.departement.trim()) err.departement = 'Département requis';
      if (!row.poste.trim()) err.poste = 'Poste requis';
      if (!row.mot_de_passe.trim()) err.mot_de_passe = 'Mot de passe requis';
      if (!row.civilite) err.civilite = 'Civilité requise';
      if (!row.genre) err.genre = 'Genre requis';

      if (Object.keys(err).length > 0) {
        allValid = false;
        errors[i] = err;
      }
    }

    const validRows = empRows.filter(
      (r, i) => !isRowEmpty(r) && Object.keys(errors[i]).length === 0,
    );

    return { valid: allValid, errors, validRows };
  }

  async function handleCreateEmploye(e: React.FormEvent) {
    e.preventDefault();
    if (!detail) return;

    setEmpError('');
    setEmpSuccess(null);

    const { valid, errors, validRows } = validateRows();

    if (validRows.length === 0) {
      setEmpErrors(errors);
      setEmpError('Remplissez au moins une ligne complète (prénom, nom, email, téléphone, département, poste, mot de passe, civilité, genre).');
      return;
    }

    if (!valid) {
      setEmpErrors(errors);
      const invalidCount = errors.filter((err, i) =>
        Object.keys(err).length > 0 && !isRowEmpty(empRows[i]),
      ).length;
      setEmpError(`${invalidCount} employé${invalidCount > 1 ? 's' : ''} incomplet${invalidCount > 1 ? 's' : ''}. Corrigez les champs manquants.`);
      return;
    }

    setEmpErrors([]);
    setEmpLoading(true);
    try {
      const res = await createEmployes({
        entrepriseId: detail.id,
        employes: validRows,
      });
      setEmpRows([defaultEmp()]);
      setEmpErrors([]);
      const forfaitMsg = res.forfait
        ? ` — Places restantes: ${res.forfait.places_restantes}/${res.forfait.nombre_user_autorise}`
        : '';
      setEmpSuccess(`${res.total_cree} employé(s) créé(s)${res.ignores > 0 ? ` — ${res.ignores} ignoré(s)` : ''}${forfaitMsg}`);
      onRefresh?.();
    } catch (err: unknown) {
      const msg = (err as Error & { data?: { message?: string } }).data?.message || 'Erreur lors de la création';
      setEmpError(msg);
    } finally {
      setEmpLoading(false);
    }
  }

  const closeEmpModal = useCallback(() => {
    setShowCreateEmp(false);
    setEmpRows([defaultEmp()]);
    setEmpError('');
    setEmpSuccess(null);
    setEmpErrors([]);
    setDepts([]);
  }, []);

  useEffect(() => {
    if (showCreateEmp && detail) {
      setDeptsLoading(true);
      getDepartements(detail.id)
        .then((res) => setDepts(res.departements))
        .catch(() => setDepts([]))
        .finally(() => setDeptsLoading(false));
    }
  }, [showCreateEmp, detail]);

  function getDeptName(d: Employe['departement']) {
    return typeof d === 'string' ? d : d.nom;
  }

  function openEmpDetail(emp: Employe) {
    setSelectedEmploye(emp);
    setShowEmpDetail(true);
  }

  function openEmpEdit(emp: Employe) {
    setSelectedEmploye(emp);
    setEditEmpPrenom(emp.prenom);
    setEditEmpNom(emp.nom);
    setEditEmpEmail(emp.email);
    setEditEmpDepartement(getDeptName(emp.departement));
    setEditEmpPoste(emp.poste);
    setEditEmpTelephone(emp.telephone);
    setEditEmpRole(emp.role as 'EMPLOYE' | 'MANAGER' | 'CONSULTANT');
    setEmpActionError('');
    setShowEmpEdit(true);
  }

  async function handleToggleBlock(emp: Employe) {
    try {
      await toggleBlockEmploye(emp.id);
      onRefresh?.();
    } catch {
      // ignore
    }
  }

  async function handleEditEmploye(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedEmploye) return;
    setEmpActionError('');
    setEmpActionLoading(true);
    try {
      const payload: Parameters<typeof updateEmploye>[1] = {};
      if (editEmpPrenom.trim()) payload.prenom = editEmpPrenom.trim();
      if (editEmpNom.trim()) payload.nom = editEmpNom.trim();
      if (editEmpEmail.trim()) payload.email = editEmpEmail.trim();
      if (editEmpDepartement.trim()) payload.departement = editEmpDepartement.trim();
      if (editEmpPoste.trim()) payload.poste = editEmpPoste.trim();
      if (editEmpTelephone.trim()) payload.telephone = editEmpTelephone.trim();
      payload.role = editEmpRole;
      await updateEmploye(selectedEmploye.id, payload);
      setShowEmpEdit(false);
      onRefresh?.();
    } catch (err: unknown) {
      const msg = (err as Error & { data?: { message?: string } }).data?.message || 'Erreur lors de la modification';
      setEmpActionError(msg);
    } finally {
      setEmpActionLoading(false);
    }
  }

  async function handleDeleteEmploye() {
    if (!selectedEmploye) return;
    setEmpActionLoading(true);
    try {
      await deleteEmploye(selectedEmploye.id);
      setShowEmpDelete(false);
      setSelectedEmploye(null);
      onRefresh?.();
    } catch (err: unknown) {
      const msg = (err as Error & { data?: { message?: string } }).data?.message || 'Erreur lors de la suppression';
      setEmpActionError(msg);
    } finally {
      setEmpActionLoading(false);
    }
  }

  const loadBudgets = useCallback(async () => {
    if (!detail?.identifiant) return;
    setBudgetsLoading(true);
    try {
      const res = await getBudgetsByEntreprise(detail.identifiant);
      setBudgets(res.budgets);
    } catch {
      setBudgets([]);
    } finally {
      setBudgetsLoading(false);
    }
  }, [detail?.identifiant]);

  const loadPolitiques = useCallback(async () => {
    if (!detail?.id) return;
    setPolitiquesLoading(true);
    try {
      const res = await getPolitiques();
      const filtered = res.politiques.filter((p) => p.user?.entrepriseId === detail.id);
      setPolitiques(filtered);
    } catch {
      setPolitiques([]);
    } finally {
      setPolitiquesLoading(false);
    }
  }, [detail?.id]);

  useEffect(() => {
    if (activeTab === 'budget' && detail) loadBudgets();
    if (activeTab === 'politique' && detail) loadPolitiques();
    if (activeTab === 'departements' && detail) {
      setDeptsLoading(true);
      getDepartements(detail.id)
        .then((res) => setDepts(res.departements))
        .catch(() => setDepts([]))
        .finally(() => setDeptsLoading(false));
    }
  }, [activeTab, detail, loadBudgets, loadPolitiques]);

  async function handleCreateDepartement(e: React.FormEvent) {
    e.preventDefault();
    if (!detail || !newDeptName.trim()) return;

    setCreateDeptError('');
    setCreateDeptLoading(true);
    try {
      await createDepartement({
        nom: newDeptName.trim(),
        entrepriseId: detail.id,
      });
      setNewDeptName('');
      setShowCreateDept(false);
      // Reload departments
      setDeptsLoading(true);
      const res = await getDepartements(detail.id);
      setDepts(res.departements);
      setDeptsLoading(false);
    } catch (err: unknown) {
      const msg = (err as Error & { data?: { message?: string } }).data?.message || 'Erreur lors de la création';
      setCreateDeptError(msg);
    } finally {
      setCreateDeptLoading(false);
    }
  }

  const inner = (
    <>
      <div className={`sticky top-0 bg-white px-6 py-4 border-b border-[#e5e5e5] flex items-center justify-between ${asPage ? 'rounded-t-2xl' : ''}`}>
        <h3 className="text-lg font-semibold text-[#565556] flex items-center gap-2">
          <Building2 className="w-5 h-5 text-[#A11B1B]" />
          Détails de l'entreprise
        </h3>
        {!asPage && (
          <button onClick={onClose} className="p-1 rounded-md hover:bg-[#f4f4f4] text-[#A5A6A5]">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Barre d'onglets */}
      <div className="px-6 border-b border-[#e5e5e5] bg-white">
        <div className="flex gap-1">
          {([
            { key: 'details', label: 'Détails', icon: Building2 },
            { key: 'employes', label: 'Employés', icon: Users },
            { key: 'departements', label: 'Départements', icon: Building },
            { key: 'budget', label: 'Budgets', icon: Wallet },
            { key: 'politique', label: 'Politiques', icon: Plane },
          ] as const).map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === t.key
                  ? 'border-[#A11B1B] text-[#A11B1B]'
                  : 'border-transparent text-[#A5A6A5] hover:text-[#565556]'
              }`}
            >
              <t.icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-[#A5A6A5]">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Chargement…</span>
          </div>
        ) : !detail ? (
          <div className="text-center py-12 text-[#A5A6A5] text-sm"><span>Impossible de charger les détails</span></div>
        ) : (
          <>
            {/* === SECTION DÉTAILS === */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                <div className="flex flex-col items-center gap-3">
                  {detail.logo ? (
                    <img
                      src={detail.logo}
                      alt="Logo"
                      className="h-20 w-auto rounded-lg object-contain shadow-sm"
                      referrerPolicy="no-referrer"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-[#f4f4f4] flex items-center justify-center">
                      <Building2 className="w-10 h-10 text-[#A5A6A5]" />
                    </div>
                  )}
                  <div className="text-center">
                    <h4 className="text-xl font-bold text-[#565556]">{detail.nom}</h4>
                    <div className="mt-1.5">
                      {detail.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                          <Lock className="w-3.5 h-3.5" />
                          Bloquée
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                    <p className="text-xs text-[#A5A6A5] uppercase tracking-wide"><span>Identifiant</span></p>
                    <p className="text-base font-semibold text-[#565556] mt-1 font-mono">{detail.identifiant}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                    <p className="text-xs text-[#A5A6A5] uppercase tracking-wide"><span>Adresse</span></p>
                    <p className="text-base font-semibold text-[#565556] mt-1">{detail.adresse}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                    <p className="text-xs text-[#A5A6A5] uppercase tracking-wide"><span>Pays</span></p>
                    <p className="text-base font-semibold text-[#565556] mt-1">{detail.pays}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                    <p className="text-xs text-[#A5A6A5] uppercase tracking-wide"><span>Région</span></p>
                    <p className="text-base font-semibold text-[#565556] mt-1">{detail.region}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                    <p className="text-xs text-[#A5A6A5] uppercase tracking-wide"><span>Ville</span></p>
                    <p className="text-base font-semibold text-[#565556] mt-1">{detail.ville}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                    <p className="text-xs text-[#A5A6A5] uppercase tracking-wide"><span>Statut</span></p>
                    <p className="text-base font-semibold mt-1">
                      {detail.is_active ? (
                        <span className="inline-flex items-center gap-1 text-green-700">
                          <CheckCircle2 className="w-4 h-4" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-gray-600">
                          <Lock className="w-4 h-4" />
                          Bloquée
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Forfait */}
                {detail.forfait && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-[#A11B1B]/5 to-[#8a1616]/5 border border-[#A11B1B]/20">
                    <h5 className="text-sm font-semibold text-[#565556] mb-3 flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-[#A11B1B]" />
                      Forfait de l'entreprise
                    </h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-xs text-[#A5A6A5]">Utilisateurs actuels</p>
                        <p className="text-lg font-bold text-[#565556]">{detail.forfait.nombre_user_actuel}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-[#A5A6A5]">Utilisateurs autorisés</p>
                        <p className="text-lg font-bold text-[#A11B1B]">{detail.forfait.nombre_user_autorise}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="w-full bg-[#e5e5e5] rounded-full h-2">
                        <div
                          className="bg-[#A11B1B] h-2 rounded-full transition-all"
                          style={{ width: `${Math.min((detail.forfait.nombre_user_actuel / detail.forfait.nombre_user_autorise) * 100, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-[#A5A6A5] mt-1 text-center">
                        {detail.forfait.nombre_user_actuel} / {detail.forfait.nombre_user_autorise} utilisateurs utilisés
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* === SECTION EMPLOYÉS === */}
            {activeTab === 'employes' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-[#565556] flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#A11B1B]" />
                    <span>Employés ({detail.users?.length ?? 0})</span>
                  </h4>
                  <button
                    onClick={() => {
                      setShowCreateEmp(true);
                      setEmpError('');
                      setEmpSuccess(null);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#A11B1B] text-white text-xs font-medium hover:bg-[#8a1616] transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Créer des employés</span>
                  </button>
                </div>

                {detail.users && detail.users.length > 0 ? (
                  <div className="overflow-x-auto rounded-xl border border-[#e5e5e5]">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#e5e5e5] bg-[#fafafa]">
                          <th className="text-left px-4 py-2.5 font-medium text-[#565556]"><span>Nom</span></th>
                          <th className="text-left px-4 py-2.5 font-medium text-[#565556]"><span>Email</span></th>
                          <th className="text-left px-4 py-2.5 font-medium text-[#565556]"><span>Poste</span></th>
                          <th className="text-left px-4 py-2.5 font-medium text-[#565556]"><span>Département</span></th>
                          <th className="text-left px-4 py-2.5 font-medium text-[#565556]"><span>Rôle</span></th>
                          <th className="text-left px-4 py-2.5 font-medium text-[#565556]"><span>Statut</span></th>
                          <th className="text-right px-4 py-2.5 font-medium text-[#565556]"><span>Actions</span></th>
                        </tr>
                      </thead>
                      <tbody>
                        {detail.users.map((u) => (
                          <tr key={u.id} className="border-b border-[#f0f0f0]">
                            <td className="px-4 py-2.5 text-[#565556]">{u.prenom} {u.nom}</td>
                            <td className="px-4 py-2.5 text-[#A5A6A5]">{u.email}</td>
                            <td className="px-4 py-2.5 text-[#565556]">{u.poste}</td>
                            <td className="px-4 py-2.5 text-[#565556]">{u.departement}</td>
                            <td className="px-4 py-2.5">
                              <span className="inline-block px-2 py-0.5 rounded bg-[#f4f4f4] text-xs text-[#565556]">
                                {u.role}
                              </span>
                            </td>
                            <td className="px-4 py-2.5">
                              {(u as Employe).is_block ? (
                                <span className="inline-flex items-center gap-1 text-xs text-red-600">
                                  <Ban className="w-3.5 h-3.5" />
                                  Bloqué
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs text-green-700">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Actif
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => openEmpDetail(u as Employe)}
                                  className="p-1.5 rounded-md hover:bg-[#f4f4f4] text-[#565556]"
                                  title="Détail"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => openEmpEdit(u as Employe)}
                                  className="p-1.5 rounded-md hover:bg-[#f4f4f4] text-[#565556]"
                                  title="Modifier"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleToggleBlock(u as Employe)}
                                  className={`p-1.5 rounded-md hover:bg-[#f4f4f4] ${(u as Employe).is_block ? 'text-green-700' : 'text-red-600'}`}
                                  title={(u as Employe).is_block ? 'Débloquer' : 'Bloquer'}
                                >
                                  {(u as Employe).is_block ? <Unlock className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                                </button>
                                <button
                                  onClick={() => { setSelectedEmploye(u as Employe); setShowEmpDelete(true); }}
                                  className="p-1.5 rounded-md hover:bg-red-50 text-red-600"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-[#A5A6A5] italic"><span>Aucun employé dans cette entreprise</span></p>
                )}
              </div>
            )}

            {/* === SECTION DÉPARTEMENTS === */}
            {activeTab === 'departements' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-[#565556] flex items-center gap-2">
                    <Building className="w-4 h-4 text-[#A11B1B]" />
                    <span>Départements ({depts.length})</span>
                  </h4>
                  <button
                    onClick={() => {
                      setShowCreateDept(true);
                      setNewDeptName('');
                      setCreateDeptError('');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#A11B1B] text-white text-xs font-medium hover:bg-[#8a1616] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Créer un département</span>
                  </button>
                </div>

                {deptsLoading ? (
                  <div className="flex items-center justify-center py-12 text-[#A5A6A5]">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    <span>Chargement…</span>
                  </div>
                ) : depts.length === 0 ? (
                  <p className="text-sm text-[#A5A6A5] italic"><span>Aucun département dans cette entreprise</span></p>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-[#e5e5e5]">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#e5e5e5] bg-[#fafafa]">
                          <th className="text-left px-4 py-2.5 font-medium text-[#565556]"><span>Nom</span></th>
                          <th className="text-left px-4 py-2.5 font-medium text-[#565556]"><span>Employés</span></th>
                        </tr>
                      </thead>
                      <tbody>
                        {depts.map((d) => (
                          <tr key={d.id} className="border-b border-[#f0f0f0]">
                            <td className="px-4 py-2.5 text-[#565556]">{d.nom}</td>
                            <td className="px-4 py-2.5">
                              <span className="inline-flex items-center gap-1 text-[#565556]">
                                <Users className="w-3.5 h-3.5 text-[#A5A6A5]" />
                                {d._count?.users ?? 0}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* === SECTION BUDGETS === */}
            {activeTab === 'budget' && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-[#565556] flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-[#A11B1B]" />
                  <span>Budgets annuels</span>
                </h4>
                {budgetsLoading ? (
                  <div className="flex items-center justify-center py-12 text-[#A5A6A5]">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    <span>Chargement…</span>
                  </div>
                ) : budgets.length === 0 ? (
                  <p className="text-sm text-[#A5A6A5] italic"><span>Aucun budget enregistré pour cette entreprise</span></p>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-[#e5e5e5]">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#e5e5e5] bg-[#fafafa]">
                          <th className="text-left px-4 py-2.5 font-medium text-[#565556]"><span>Référence</span></th>
                          <th className="text-left px-4 py-2.5 font-medium text-[#565556]"><span>Année</span></th>
                          <th className="text-left px-4 py-2.5 font-medium text-[#565556]"><span>Budget</span></th>
                          <th className="text-left px-4 py-2.5 font-medium text-[#565556]"><span>Restant</span></th>
                          <th className="text-left px-4 py-2.5 font-medium text-[#565556]"><span>Statut</span></th>
                        </tr>
                      </thead>
                      <tbody>
                        {budgets.map((b) => (
                          <tr key={b.id} className="border-b border-[#f0f0f0]">
                            <td className="px-4 py-2.5 text-[#565556]">{b.reference}</td>
                            <td className="px-4 py-2.5 text-[#565556]">{b.annee}</td>
                            <td className="px-4 py-2.5 text-[#565556]">{b.budget}</td>
                            <td className="px-4 py-2.5 text-[#565556]">{b.montant_restant ?? '—'}</td>
                            <td className="px-4 py-2.5">
                              {b.est_cloture ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                                  <Lock className="w-3 h-3" />
                                  <span>Clôturé</span>
                                </span>
                              ) : b.est_active ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-medium">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Actif</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                                  <span>Inactif</span>
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* === SECTION POLITIQUES === */}
            {activeTab === 'politique' && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-[#565556] flex items-center gap-2">
                  <Plane className="w-4 h-4 text-[#A11B1B]" />
                  <span>Politiques de voyage</span>
                </h4>
                {politiquesLoading ? (
                  <div className="flex items-center justify-center py-12 text-[#A5A6A5]">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    <span>Chargement…</span>
                  </div>
                ) : politiques.length === 0 ? (
                  <p className="text-sm text-[#A5A6A5] italic"><span>Aucune politique enregistrée pour cette entreprise</span></p>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-[#e5e5e5]">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#e5e5e5] bg-[#fafafa]">
                          <th className="text-left px-4 py-2.5 font-medium text-[#565556]"><span>Employé</span></th>
                          <th className="text-left px-4 py-2.5 font-medium text-[#565556]"><span>Matricule</span></th>
                          <th className="text-left px-4 py-2.5 font-medium text-[#565556]"><span>Y (Économique)</span></th>
                          <th className="text-left px-4 py-2.5 font-medium text-[#565556]"><span>W (Premium)</span></th>
                          <th className="text-left px-4 py-2.5 font-medium text-[#565556]"><span>J (Affaires)</span></th>
                          <th className="text-left px-4 py-2.5 font-medium text-[#565556]"><span>F (Première)</span></th>
                          <th className="text-left px-4 py-2.5 font-medium text-[#565556]"><span>Hôtel</span></th>
                        </tr>
                      </thead>
                      <tbody>
                        {politiques.map((p) => (
                          <tr key={p.id} className="border-b border-[#f0f0f0]">
                            <td className="px-4 py-2.5 text-[#565556]">{p.user?.prenom} {p.user?.nom}</td>
                            <td className="px-4 py-2.5 text-[#565556] font-mono">{p.matricule}</td>
                            <td className="px-4 py-2.5">{p.y ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Ban className="w-4 h-4 text-red-400" />}</td>
                            <td className="px-4 py-2.5">{p.w ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Ban className="w-4 h-4 text-red-400" />}</td>
                            <td className="px-4 py-2.5">{p.j ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Ban className="w-4 h-4 text-red-400" />}</td>
                            <td className="px-4 py-2.5">{p.f ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Ban className="w-4 h-4 text-red-400" />}</td>
                            <td className="px-4 py-2.5 text-[#565556]">{p.hotel} <span>étoile(s)</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Sous-modal : Créer des employés */}
      {showCreateEmp && detail && (
        <Modal isOpen={showCreateEmp} onClose={closeEmpModal} size="2xl" className="h-[85vh]">
          <form onSubmit={handleCreateEmploye} className="flex flex-col flex-1 min-h-0">
            <ModalHeader
              title="Créer des employés"
              icon={<UserPlus className="w-5 h-5 text-white" />}
              variant="brand"
            >
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs text-white font-medium">
                {empRows.length}
              </span>
            </ModalHeader>
            <ModalBody className="p-6 space-y-4">
              {empSuccess && (
                <div key="emp-success" className="px-3 py-2 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {empSuccess}
                </div>
              )}
              {empError && (
                <div key="emp-error" className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                  {empError}
                </div>
              )}

              <div className="space-y-3">
                {empRows.map((row, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#A11B1B] uppercase tracking-wide">
                        <span>Employé {i + 1}</span>
                      </span>
                      {empRows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRow(i)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 rounded-md transition-colors"
                          title="Supprimer cette ligne"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {empErrors[i] && Object.keys(empErrors[i]).length > 0 && (
                      <div className="rounded-lg bg-red-50 border border-red-200 p-2.5 text-xs text-red-600 space-y-1">
                        {Object.values(empErrors[i]).map((msg, idx) => (
                          <div key={idx}>{msg}</div>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-[#565556]">Prénom *</label>
                        <input
                          value={row.prenom}
                          onChange={(e) => updateRow(i, { prenom: e.target.value })}
                          required
                          className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10 bg-white"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-[#565556]">Nom *</label>
                        <input
                          value={row.nom}
                          onChange={(e) => updateRow(i, { nom: e.target.value })}
                          required
                          className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10 bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-[#565556]">Email *</label>
                        <input
                          type="email"
                          value={row.email}
                          onChange={(e) => updateRow(i, { email: e.target.value })}
                          required
                          className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10 bg-white"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-[#565556]"><span>Téléphone *</span></label>
                        <input
                          value={row.telephone}
                          onChange={(e) => updateRow(i, { telephone: e.target.value })}
                          required
                          className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10 bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-[#565556]">Département *</label>
                        {deptsLoading ? (
                          <div className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#A5A6A5] bg-[#fafafa] flex items-center gap-2">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Chargement…
                          </div>
                        ) : depts.length > 0 ? (
                          <select
                            value={row.departement}
                            onChange={(e) => updateRow(i, { departement: e.target.value })}
                            required
                            className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10 bg-white"
                          >
                            <option value="">Choisir…</option>
                            {depts.map((d) => (
                              <option key={d.id} value={d.nom}>
                                {d.nom}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            value={row.departement}
                            onChange={(e) => updateRow(i, { departement: e.target.value })}
                            required
                            placeholder="Saisir le département"
                            className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10 bg-white"
                          />
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-[#565556]">Poste *</label>
                        <input
                          value={row.poste}
                          onChange={(e) => updateRow(i, { poste: e.target.value })}
                          required
                          className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10 bg-white"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-[#565556]"><span>Rôle</span></label>
                        <select
                          value={row.role}
                          onChange={(e) => updateRow(i, { role: e.target.value as 'EMPLOYE' | 'MANAGER' | 'CONSULTANT' })}
                          className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10 bg-white"
                        >
                          <option value="EMPLOYE">Employé</option>
                          <option value="MANAGER">Manager</option>
                          <option value="CONSULTANT">Consultant</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 sm:w-1/2">
                      <label className="text-xs font-medium text-[#565556]">Mot de passe *</label>
                      <input
                        type="password"
                        value={row.mot_de_passe}
                        onChange={(e) => updateRow(i, { mot_de_passe: e.target.value })}
                        required
                        className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10 bg-white"
                      />
                    </div>

                    {/* Informations de voyage (optionnelles) */}
                    <div className="pt-3 border-t border-[#e5e5e5]">
                      <p className="text-xs font-medium text-[#A5A6A5] mb-2">Informations de voyage (optionnelles)</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium text-[#565556]">Civilité *</label>
                          <select
                            value={row.civilite || ''}
                            onChange={(e) => updateRow(i, { civilite: e.target.value })}
                            required
                            className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10 bg-white"
                          >
                            <option value="">Non spécifié</option>
                            <option value="M.">M.</option>
                            <option value="Mme">Mme</option>
                            <option value="Dr">Dr</option>
                            <option value="Pr">Pr</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium text-[#565556]">Genre *</label>
                          <select
                            value={row.genre || ''}
                            onChange={(e) => updateRow(i, { genre: e.target.value })}
                            required
                            className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10 bg-white"
                          >
                            <option value="">Non spécifié</option>
                            <option value="M">Masculin</option>
                            <option value="F">Féminin</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium text-[#565556]">Numéro de passeport</label>
                          <input
                            value={row.numero_passport || ''}
                            onChange={(e) => updateRow(i, { numero_passport: e.target.value })}
                            placeholder="123456789"
                            className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10 bg-white"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium text-[#565556]">Date expiration passeport</label>
                          <input
                            type="date"
                            value={row.date_expiration_passport || ''}
                            onChange={(e) => updateRow(i, { date_expiration_passport: e.target.value })}
                            className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10 bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addRow}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-[#A5A6A5] text-sm text-[#565556] hover:border-[#A11B1B] hover:text-[#A11B1B] hover:bg-[#A11B1B]/5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter un autre employé</span>
              </button>
            </ModalBody>
            <ModalFooter className="gap-3">
              <button
                type="button"
                onClick={closeEmpModal}
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-[#565556] hover:bg-[#f4f4f4] transition-colors"
              >
                <span>Annuler</span>
              </button>
              <button
                type="submit"
                disabled={empLoading}
                className="px-5 py-2.5 rounded-lg bg-[#A11B1B] text-white text-sm font-medium hover:bg-[#8a1616] transition-colors disabled:opacity-60"
              >
                {empLoading ? <span>Création…</span> : <span>Créer {empRows.length} employé{empRows.length > 1 ? 's' : ''}</span>}
              </button>
            </ModalFooter>
          </form>
        </Modal>
      )}

      {/* Modal : Détail employé */}
      {showEmpDetail && selectedEmploye && (
        <Modal isOpen={showEmpDetail} onClose={() => setShowEmpDetail(false)} size="md">
          <ModalHeader
            title="Détail de l'employé"
            subtitle={`${selectedEmploye.prenom} ${selectedEmploye.nom}`}
            icon={<User className="w-5 h-5 text-white" />}
            variant="brand"
          />
          <ModalBody className="p-6 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-[#fafafa] border border-[#e5e5e5]">
                <p className="text-xs text-[#A5A6A5] uppercase"><span>Prénom</span></p>
                <p className="text-sm font-semibold text-[#565556] mt-0.5">{selectedEmploye.prenom}</p>
              </div>
              <div className="p-3 rounded-lg bg-[#fafafa] border border-[#e5e5e5]">
                <p className="text-xs text-[#A5A6A5] uppercase"><span>Nom</span></p>
                <p className="text-sm font-semibold text-[#565556] mt-0.5">{selectedEmploye.nom}</p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[#fafafa] border border-[#e5e5e5]">
              <p className="text-xs text-[#A5A6A5] uppercase"><span>Email</span></p>
              <p className="text-sm font-semibold text-[#565556] mt-0.5">{selectedEmploye.email}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-[#fafafa] border border-[#e5e5e5]">
                <p className="text-xs text-[#A5A6A5] uppercase"><span>Matricule</span></p>
                <p className="text-sm font-semibold text-[#565556] mt-0.5 font-mono">{selectedEmploye.matricule}</p>
              </div>
              <div className="p-3 rounded-lg bg-[#fafafa] border border-[#e5e5e5]">
                <p className="text-xs text-[#A5A6A5] uppercase"><span>Téléphone</span></p>
                <p className="text-sm font-semibold text-[#565556] mt-0.5">{selectedEmploye.telephone || '—'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-[#fafafa] border border-[#e5e5e5]">
                <p className="text-xs text-[#A5A6A5] uppercase"><span>Département</span></p>
                <p className="text-sm font-semibold text-[#565556] mt-0.5">{getDeptName(selectedEmploye.departement)}</p>
              </div>
              <div className="p-3 rounded-lg bg-[#fafafa] border border-[#e5e5e5]">
                <p className="text-xs text-[#A5A6A5] uppercase"><span>Poste</span></p>
                <p className="text-sm font-semibold text-[#565556] mt-0.5">{selectedEmploye.poste}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-[#fafafa] border border-[#e5e5e5]">
                <p className="text-xs text-[#A5A6A5] uppercase"><span>Rôle</span></p>
                <p className="text-sm font-semibold text-[#565556] mt-0.5">{selectedEmploye.role}</p>
              </div>
              <div className="p-3 rounded-lg bg-[#fafafa] border border-[#e5e5e5]">
                <p className="text-xs text-[#A5A6A5] uppercase"><span>Statut</span></p>
                <p className="text-sm font-semibold mt-0.5">
                  {selectedEmploye.is_block ? (
                    <span className="inline-flex items-center gap-1 text-red-600">
                      <Ban className="w-3.5 h-3.5" />
                      Bloqué
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-green-700">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Actif
                    </span>
                  )}
                </p>
              </div>
            </div>
          </ModalBody>
        </Modal>
      )}

      {/* Modal : Édition employé */}
      {showEmpEdit && selectedEmploye && (
        <Modal isOpen={showEmpEdit} onClose={() => setShowEmpEdit(false)} size="lg">
          <ModalHeader
            title="Modifier l'employé"
            subtitle={`${selectedEmploye.prenom} ${selectedEmploye.nom}`}
            icon={<Pencil className="w-5 h-5 text-white" />}
            variant="brand"
          />
          <form onSubmit={handleEditEmploye}>
            <ModalBody className="p-6 space-y-4">
              {empActionError && (
                <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                  {empActionError}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-[#565556]">Prénom *</label>
                  <input
                    value={editEmpPrenom}
                    onChange={(e) => setEditEmpPrenom(e.target.value)}
                    required
                    className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-[#565556]">Nom *</label>
                  <input
                    value={editEmpNom}
                    onChange={(e) => setEditEmpNom(e.target.value)}
                    required
                    className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[#565556]">Email *</label>
                <input
                  type="email"
                  value={editEmpEmail}
                  onChange={(e) => setEditEmpEmail(e.target.value)}
                  required
                  className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-[#565556]">Département *</label>
                  <input
                    value={editEmpDepartement}
                    onChange={(e) => setEditEmpDepartement(e.target.value)}
                    required
                    className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-[#565556]">Poste *</label>
                  <input
                    value={editEmpPoste}
                    onChange={(e) => setEditEmpPoste(e.target.value)}
                    required
                    className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-[#565556]"><span>Téléphone</span></label>
                  <input
                    value={editEmpTelephone}
                    onChange={(e) => setEditEmpTelephone(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-[#565556]"><span>Rôle</span></label>
                  <select
                    value={editEmpRole}
                    onChange={(e) => setEditEmpRole(e.target.value as 'EMPLOYE' | 'MANAGER' | 'CONSULTANT')}
                    className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10 bg-white"
                  >
                    <option value="EMPLOYE">Employé</option>
                    <option value="MANAGER">Manager</option>
                    <option value="CONSULTANT">Consultant</option>
                  </select>
                </div>
              </div>
            </ModalBody>
            <ModalFooter className="gap-3">
              <button
                type="button"
                onClick={() => setShowEmpEdit(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-[#565556] hover:bg-[#f4f4f4] transition-colors"
              >
                <span>Annuler</span>
              </button>
              <button
                type="submit"
                disabled={empActionLoading}
                className="px-4 py-2 rounded-lg bg-[#A11B1B] text-white text-sm font-medium hover:bg-[#8a1616] transition-colors disabled:opacity-60"
              >
                {empActionLoading ? <span>Modification…</span> : <span>Enregistrer</span>}
              </button>
            </ModalFooter>
          </form>
        </Modal>
      )}

      {/* Modal : Créer un département */}
      {showCreateDept && (
        <Modal isOpen={showCreateDept} onClose={() => setShowCreateDept(false)} size="md">
          <ModalHeader
            title="Créer un département"
            icon={<Building className="w-5 h-5 text-white" />}
            variant="brand"
          />
          <form onSubmit={handleCreateDepartement}>
            <ModalBody className="p-6 space-y-4">
              {createDeptError && (
                <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                  {createDeptError}
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#565556]">Nom du département</label>
                <input
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  placeholder="Ex: Marketing, IT, RH..."
                  required
                  className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10"
                />
              </div>
            </ModalBody>
            <ModalFooter className="gap-3">
              <button
                type="button"
                onClick={() => setShowCreateDept(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-[#565556] hover:bg-[#f4f4f4] transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={createDeptLoading}
                className="px-4 py-2 rounded-lg bg-[#A11B1B] text-white text-sm font-medium hover:bg-[#8a1616] transition-colors disabled:opacity-60"
              >
                {createDeptLoading ? 'Création…' : 'Créer'}
              </button>
            </ModalFooter>
          </form>
        </Modal>
      )}

      {/* Modal : Suppression employé */}
      {showEmpDelete && selectedEmploye && (
        <Modal isOpen={showEmpDelete} onClose={() => setShowEmpDelete(false)} size="sm">
          <ModalHeader
            title="Supprimer l'employé"
            subtitle="Cette action est irréversible"
            icon={<AlertTriangle className="w-5 h-5 text-white" />}
            variant="brand"
          />
          <ModalBody className="p-6 space-y-4 text-center">
            <p className="text-sm text-[#A5A6A5]">
              <span>{selectedEmploye.prenom} {selectedEmploye.nom} ({selectedEmploye.matricule}) sera définitivement supprimé.</span>
            </p>
            {empActionError && (
              <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                {empActionError}
              </div>
            )}
          </ModalBody>
          <ModalFooter className="gap-3 justify-center">
            <button
              onClick={() => setShowEmpDelete(false)}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-[#565556] hover:bg-[#f4f4f4] transition-colors"
            >
              <span>Annuler</span>
            </button>
            <button
              onClick={handleDeleteEmploye}
              disabled={empActionLoading}
              className="px-5 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-60"
            >
              {empActionLoading ? <span>Suppression…</span> : <span>Supprimer</span>}
            </button>
          </ModalFooter>
        </Modal>
      )}
    </>
  );

  if (asPage) {
    return (
      <div className="min-h-svh bg-[#f4f4f4]">
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {inner}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-8">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        {inner}
      </div>
    </div>
  );
}
