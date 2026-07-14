import { useEffect, useState } from 'react';
import {
  Loader2, Plus, Minus, Wallet, Calendar, TrendingUp,
  ShieldCheck, Lock, Unlock, Trash2, AlertTriangle,
  X, CreditCard, Pencil, Users, Building2, RefreshCw
} from 'lucide-react';
import {
  getBudgetsAnnuels, createBudgetAnnuel, updateBudgetAnnuel, activerBudgetAnnuel,
  cloturerBudgetAnnuel, deleteBudgetAnnuel,
  allouerBudgetDepartement, allouerBudgetPersonnel,
  getBudgetDepartements, getBudgetPersonnels,
  augmenterBudgetAnnuel, diminuerBudgetAnnuel,
  augmenterBudgetDepartement, diminuerBudgetDepartement,
  augmenterBudgetPersonnel, diminuerBudgetPersonnel,
  bloquerBudgetDepartement, debloquerBudgetDepartement,
  bloquerBudgetPersonnel, debloquerBudgetPersonnel,
  getBudgetAudits,
  type BudgetAnnuel, type BudgetDepartement, type BudgetPersonnel, type BudgetAudit,
} from '../../services/budgets';
import { getDepartements, type Departement } from '../../services/departements';
import { getEmployes, type Employe } from '../../services/employes';
import { getUser } from '../../services/auth/storage';
import { getErrorMessage } from '../../lib/api-errors';
import { ErrorAlert } from '../../components/ErrorAlert';

function formatCFA(value: string | number) {
  const n = typeof value === 'string' ? parseInt(value, 10) : value;
  if (Number.isNaN(n)) return value.toString();
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(n);
}

function formatDateShort(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { month: '2-digit', year: '2-digit' });
}

function formatDateLong(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function formatAuditDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function auditActionLabel(action: string) {
  return action
    .replace('AUGMENTER_BUDGET_', 'Augmenter ')
    .replace('DIMINUER_BUDGET_', 'Diminuer ')
    .replace('ANNUEL', 'annuel')
    .replace('DEPARTEMENT', 'département')
    .replace('PERSONNEL', 'personnel')
    .replace('ALLOUER_BUDGET_', 'Allouer ')
    .replace('CREER_', 'Créer ')
    .replace('MODIFIER_', 'Modifier ')
    .replace('SUPPRIMER_', 'Supprimer ')
    .replace('ACTIVER_', 'Activer ')
    .replace('CLOTURER_', 'Clôturer ')
    .replace('BLOQUER_BUDGET_', 'Bloquer ')
    .replace('DEBLOQUER_BUDGET_', 'Débloquer ');
}

function auditActionColor(action: string) {
  if (action.startsWith('AUGMENTER')) return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: '+' };
  if (action.startsWith('DIMINUER')) return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: '-' };
  if (action.startsWith('ALLOUER')) return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: '→' };
  if (action.startsWith('ACTIVER')) return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: '✓' };
  if (action.startsWith('CLOTURER')) return { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', icon: '✕' };
  if (action.startsWith('CREER')) return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: '+' };
  if (action.startsWith('SUPPRIMER')) return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: '✕' };
  if (action.startsWith('BLOQUER')) return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: '🔒' };
  if (action.startsWith('DEBLOQUER')) return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: '🔓' };
  return { bg: 'bg-[#f4f4f4]', text: 'text-[#565556]', border: 'border-[#e5e5e5]', icon: '•' };
}

function typeLabel(type: string | null) {
  switch (type) {
    case 'ANNUEL': return 'Annuel';
    case 'DEPARTEMENT': return 'Département';
    case 'PERSONNEL': return 'Personnel';
    default: return type || '—';
  }
}

function roleColor(role: string) {
  switch (role) {
    case 'SUPERADMIN': return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' };
    case 'ADMIN': return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
    case 'MANAGER': return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    default: return { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' };
  }
}

export default function Budgets() {
  const [budgets, setBudgets] = useState<BudgetAnnuel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Création
  const [showCreate, setShowCreate] = useState(false);
  const [annee, setAnnee] = useState(new Date().getFullYear() + 1);
  const [dateDebut, setDateDebut] = useState(`${new Date().getFullYear() + 1}-01-01`);
  const [dateFin, setDateFin] = useState(`${new Date().getFullYear() + 1}-12-31`);
  const [montant, setMontant] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  // Actions rapides (activer/clôturer)
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // Bloquer / débloquer département/personnel
  const [blockLoadingKey, setBlockLoadingKey] = useState<string | null>(null);

  // Sélection carte
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Édition
  const [showEdit, setShowEdit] = useState(false);
  const [editAnnee, setEditAnnee] = useState(2026);
  const [editDateDebut, setEditDateDebut] = useState('');
  const [editDateFin, setEditDateFin] = useState('');
  const [editMontant, setEditMontant] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Allocation
  const [depts, setDepts] = useState<Departement[]>([]);
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [budgetDepts, setBudgetDepts] = useState<BudgetDepartement[]>([]);
  const [budgetPersonnels, setBudgetPersonnels] = useState<BudgetPersonnel[]>([]);
  const [allocLoading, setAllocLoading] = useState(false);
  const [allocError, setAllocError] = useState('');
  const [allocSuccess, setAllocSuccess] = useState<string | null>(null);

  // Formulaire allocation département
  const [allocDeptId, setAllocDeptId] = useState('');
  const [allocDeptMontant, setAllocDeptMontant] = useState('');

  // Formulaire allocation personnel
  const [allocPersoMatricule, setAllocPersoMatricule] = useState('');
  const [allocPersoMontant, setAllocPersoMontant] = useState('');
  const [allocPersoViaDept, setAllocPersoViaDept] = useState('');

  // Audits
  const [audits, setAudits] = useState<BudgetAudit[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditPage, setAuditPage] = useState(1);
  const [auditLimit] = useState(20);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditActionFilter, setAuditActionFilter] = useState('');
  const [auditRoleFilter, setAuditRoleFilter] = useState('');

  // Augmenter / Diminuer modal
  const [adjModal, setAdjModal] = useState<{
    open: boolean;
    type: 'augmenter' | 'diminuer';
    target: 'annuel' | 'departement' | 'personnel';
    id?: number;
    label?: string;
  }>({ open: false, type: 'augmenter', target: 'annuel' });
  const [adjMontant, setAdjMontant] = useState('');
  const [adjLoading, setAdjLoading] = useState(false);
  const [adjError, setAdjError] = useState('');

  const activeBudget =
    (selectedId != null ? budgets.find((b) => b.id === selectedId) : undefined) ??
    budgets.find((b) => b.est_active && !b.est_cloture) ??
    budgets[0];

  useEffect(() => { loadBudgets(); }, []);
  useEffect(() => {
    if (activeBudget) {
      loadAllocations(activeBudget.reference);
      loadDepartements();
      loadEmployesList();
      loadAudits(activeBudget.reference);
    }
  }, [activeBudget?.reference]);

  async function loadBudgets() {
    setLoading(true); setError('');
    try {
      const res = await getBudgetsAnnuels();
      setBudgets(res.budgets);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally { setLoading(false); }
  }

  async function refreshBudgets() {
    try {
      const res = await getBudgetsAnnuels();
      setBudgets(res.budgets);
    } catch (err: unknown) {
      setError(getErrorMessage(err)); setTimeout(() => setError(''), 4000);
    }
  }

  function openAdj(type: 'augmenter' | 'diminuer', target: 'annuel' | 'departement' | 'personnel', id?: number, label?: string) {
    setAdjModal({ open: true, type, target, id, label });
    setAdjMontant(''); setAdjError('');
  }

  function closeAdj() {
    setAdjModal((m) => ({ ...m, open: false }));
    setAdjMontant(''); setAdjError('');
  }

  async function handleAdjSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { type, target, id } = adjModal;
    const montantValue = parseInt(adjMontant.replace(/\s/g, ''), 10);
    if (!montantValue || montantValue <= 0) { setAdjError('Veuillez saisir un montant valide.'); return; }
    setAdjError(''); setAdjLoading(true);
    try {
      if (target === 'annuel' && activeBudget) {
        if (type === 'augmenter') await augmenterBudgetAnnuel(activeBudget.reference, { montant: montantValue });
        else await diminuerBudgetAnnuel(activeBudget.reference, { montant: montantValue });
      } else if (target === 'departement' && id != null) {
        if (type === 'augmenter') await augmenterBudgetDepartement(id, { montant: montantValue });
        else await diminuerBudgetDepartement(id, { montant: montantValue });
      } else if (target === 'personnel' && id != null) {
        if (type === 'augmenter') await augmenterBudgetPersonnel(id, { montant: montantValue });
        else await diminuerBudgetPersonnel(id, { montant: montantValue });
      }
      closeAdj();
      if (activeBudget) {
        loadAllocations(activeBudget.reference);
        refreshBudgets();
        loadAudits(activeBudget.reference);
      }
    } catch (err: unknown) {
      setAdjError(getErrorMessage(err));
    } finally { setAdjLoading(false); }
  }

  function openCreate() {
    const nextYear = new Date().getFullYear() + 1;
    setAnnee(nextYear);
    setDateDebut(`${nextYear}-01-01`);
    setDateFin(`${nextYear}-12-31`);
    setMontant(''); setCreateError(''); setShowCreate(true);
  }

  function closeCreate() {
    setShowCreate(false); setCreateError(''); setMontant('');
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const budgetValue = parseInt(montant.replace(/\s/g, ''), 10);
    if (!budgetValue || budgetValue <= 0) { setCreateError('Veuillez saisir un montant valide.'); return; }
    setCreateError(''); setCreateLoading(true);
    try {
      await createBudgetAnnuel({ annee, date_debut: dateDebut, date_fin: dateFin, budget: budgetValue });
      setShowCreate(false); refreshBudgets();
      if (activeBudget) loadAudits(activeBudget.reference);
    } catch (err: unknown) {
      setCreateError(getErrorMessage(err));
    } finally { setCreateLoading(false); }
  }

  async function handleActiver(b: BudgetAnnuel) {
    setActionLoadingId(b.id);
    try { await activerBudgetAnnuel(b.id); refreshBudgets(); if (activeBudget) loadAudits(activeBudget.reference); }
    catch (err: unknown) {
      setError(getErrorMessage(err)); setTimeout(() => setError(''), 4000);
    } finally { setActionLoadingId(null); }
  }

  async function handleCloturer(b: BudgetAnnuel) {
    setActionLoadingId(b.id);
    try { await cloturerBudgetAnnuel(b.id); refreshBudgets(); if (activeBudget) loadAudits(activeBudget.reference); }
    catch (err: unknown) {
      setError(getErrorMessage(err)); setTimeout(() => setError(''), 4000);
    } finally { setActionLoadingId(null); }
  }

  // Suppression
  const [showDelete, setShowDelete] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<BudgetAnnuel | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  function openDelete(b: BudgetAnnuel) { setSelectedBudget(b); setDeleteError(''); setShowDelete(true); }

  async function handleDelete() {
    if (!selectedBudget) return;
    setDeleteLoading(true); setDeleteError('');
    try { await deleteBudgetAnnuel(selectedBudget.id); setShowDelete(false); refreshBudgets(); }
    catch (err: unknown) {
      setDeleteError(getErrorMessage(err));
    } finally { setDeleteLoading(false); }
  }

  // Édition
  function openEdit(b: BudgetAnnuel) {
    setEditAnnee(b.annee);
    setEditDateDebut(b.date_debut.slice(0, 10));
    setEditDateFin(b.date_fin.slice(0, 10));
    setEditMontant(b.budget);
    setEditError(''); setShowEdit(true);
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!activeBudget) return;
    const budgetValue = parseInt(editMontant.replace(/\s/g, ''), 10);
    if (!budgetValue || budgetValue <= 0) { setEditError('Veuillez saisir un montant valide.'); return; }
    setEditError(''); setEditLoading(true);
    try {
      await updateBudgetAnnuel(activeBudget.id, {
        annee: editAnnee, date_debut: editDateDebut, date_fin: editDateFin, budget: budgetValue,
      });
      setShowEdit(false); refreshBudgets();
      loadAudits(activeBudget.reference);
    } catch (err: unknown) {
      setEditError(getErrorMessage(err));
    } finally { setEditLoading(false); }
  }

  async function handleToggleBlockDept(id: number, bloquer: boolean) {
    setBlockLoadingKey(`dept-${id}`);
    try {
      if (bloquer) await debloquerBudgetDepartement(id);
      else await bloquerBudgetDepartement(id);
      if (activeBudget) {
        loadAllocations(activeBudget.reference);
        loadAudits(activeBudget.reference);
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err)); setTimeout(() => setError(''), 4000);
    } finally { setBlockLoadingKey(null); }
  }

  async function handleToggleBlockPerso(id: number, bloquer: boolean) {
    setBlockLoadingKey(`perso-${id}`);
    try {
      if (bloquer) await debloquerBudgetPersonnel(id);
      else await bloquerBudgetPersonnel(id);
      if (activeBudget) {
        loadAllocations(activeBudget.reference);
        loadAudits(activeBudget.reference);
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err)); setTimeout(() => setError(''), 4000);
    } finally { setBlockLoadingKey(null); }
  }

  // Allocation helpers
  async function loadAudits(reference: string, page = auditPage, action = auditActionFilter, role = auditRoleFilter) {
    setAuditLoading(true);
    try {
      const res = await getBudgetAudits({
        reference, page, limit: auditLimit,
        action: action || undefined,
        role_effectue_par: role || undefined,
      });
      setAudits(res.audits);
      setAuditTotal(res.total);
    } catch (err: unknown) {
      setError(getErrorMessage(err)); setTimeout(() => setError(''), 4000);
    } finally { setAuditLoading(false); }
  }

  async function loadAllocations(reference: string) {
    const [dRes, pRes] = await Promise.allSettled([
      getBudgetDepartements(reference),
      getBudgetPersonnels(reference),
    ]);
    if (dRes.status === 'fulfilled') setBudgetDepts(dRes.value.budgets);
    if (pRes.status === 'fulfilled') setBudgetPersonnels(pRes.value.budgets);
  }

  async function loadDepartements() {
    const user = getUser();
    const eid = user?.entrepriseId;
    if (!eid) { setDepts([]); return; }
    try {
      const res = await getDepartements(eid);
      setDepts(res.departements);
    } catch { setDepts([]); }
  }

  async function loadEmployesList() {
    try {
      const res = await getEmployes();
      setEmployes(res.employes);
    } catch { setEmployes([]); }
  }

  async function handleAllocDept(e: React.FormEvent) {
    e.preventDefault();
    if (!activeBudget) return;
    const id = parseInt(allocDeptId, 10);
    const montantValue = parseInt(allocDeptMontant.replace(/\s/g, ''), 10);
    if (!id || !montantValue || montantValue <= 0) { setAllocError('Veuillez sélectionner un département et saisir un montant.'); return; }
    setAllocError(''); setAllocSuccess(null); setAllocLoading(true);
    try {
      await allouerBudgetDepartement(activeBudget.reference, { departementId: id, montant_alloue: montantValue });
      setAllocSuccess('Budget département alloué avec succès');
      setAllocDeptId(''); setAllocDeptMontant('');
      loadAllocations(activeBudget.reference);
      refreshBudgets();
      loadAudits(activeBudget.reference);
    } catch (err: unknown) {
      setAllocError(getErrorMessage(err));
    } finally { setAllocLoading(false); }
  }

  async function handleAllocPerso(e: React.FormEvent) {
    e.preventDefault();
    if (!activeBudget) return;
    const montantValue = parseInt(allocPersoMontant.replace(/\s/g, ''), 10);
    if (!allocPersoMatricule.trim() || !montantValue || montantValue <= 0) { setAllocError('Veuillez sélectionner un employé et saisir un montant.'); return; }
    const payload: { matricule: string; montant_alloue: number; departementId?: number } = {
      matricule: allocPersoMatricule.trim(), montant_alloue: montantValue,
    };
    if (allocPersoViaDept) { payload.departementId = parseInt(allocPersoViaDept, 10); }
    setAllocError(''); setAllocSuccess(null); setAllocLoading(true);
    try {
      await allouerBudgetPersonnel(activeBudget.reference, payload);
      setAllocSuccess('Budget personnel alloué avec succès');
      setAllocPersoMatricule(''); setAllocPersoMontant(''); setAllocPersoViaDept('');
      loadAllocations(activeBudget.reference);
      refreshBudgets();
      loadAudits(activeBudget.reference);
    } catch (err: unknown) {
      setAllocError(getErrorMessage(err));
    } finally { setAllocLoading(false); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#565556]">Budgets</h2>
          <p className="text-sm text-[#A5A6A5] mt-1">Gérez le budget annuel de votre entreprise</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#A11B1B] text-white text-sm font-medium hover:bg-[#8a1616] transition-colors">
            <Plus className="w-4 h-4" />Créer un budget
          </button>
          <button
            onClick={refreshBudgets}
            disabled={loading}
            className="p-2 rounded-lg border border-[#e5e5e5] text-[#565556] hover:bg-[#f4f4f4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Actualiser"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && <ErrorAlert error={error} onDismiss={() => setError('')} />}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-[#A11B1B]" />
        </div>
      ) : budgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-[#e5e5e5]">
          <div className="w-16 h-16 rounded-full bg-[#f4f4f4] flex items-center justify-center mb-4">
            <Wallet className="w-8 h-8 text-[#A5A6A5]" />
          </div>
          <h3 className="text-lg font-semibold text-[#565556] mb-1">Aucun budget annuel</h3>
          <p className="text-sm text-[#A5A6A5] mb-6 text-center max-w-sm">
            Votre entreprise n'a pas encore de budget annuel. Créez-en un pour commencer à suivre vos dépenses.
          </p>
          <button onClick={openCreate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#A11B1B] text-white text-sm font-medium hover:bg-[#8a1616] transition-colors">
            <Plus className="w-4 h-4" />Créer un budget
          </button>
        </div>
      ) : activeBudget ? (
        <div className="space-y-6">
          {/* ========== Grille : Carte + Historique côte à côte ========== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Colonne gauche : Carte + détails + actions */}
            <div className="lg:col-span-2 space-y-4">
              {/* Carte Visa */}
              <div className="relative w-full max-w-xl">
                <div className="relative rounded-2xl p-8 overflow-hidden shadow-2xl"
                  style={{ background: 'linear-gradient(135deg, #A11B1B 0%, #7a1515 40%, #1a1a1a 100%)', aspectRatio: '1.586' }}
                >
                  <div className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{ background: 'linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%)' }}
                  />
                  <div className="relative flex items-start justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-9 rounded-md border border-yellow-600/60 bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 shadow-inner relative overflow-hidden">
                        <div className="absolute inset-0 border border-yellow-700/20 rounded-sm" />
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-yellow-700/30" />
                        <div className="absolute top-1/2 left-0 right-0 h-px bg-yellow-700/30" />
                      </div>
                      <div className="text-white/80 text-xs font-medium tracking-wider uppercase">Eazy Visa</div>
                    </div>
                    <CreditCard className="w-8 h-8 text-white/30" />
                  </div>
                  <div className="relative mb-6">
                    <p className="text-white/60 text-[10px] uppercase tracking-widest mb-1">Référence</p>
                    <p className="text-white text-2xl font-mono font-semibold tracking-widest">{activeBudget.reference.match(/.{1,4}/g)?.join(' ') ?? activeBudget.reference}</p>
                  </div>
                  <div className="relative flex items-end justify-between">
                    <div className="space-y-1">
                      <p className="text-white/60 text-[10px] uppercase tracking-widest">Entreprise</p>
                      <p className="text-white text-sm font-medium truncate max-w-[200px]">{activeBudget.entreprise?.nom ?? '—'}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-white/60 text-[10px] uppercase tracking-widest">Valable jusqu'au</p>
                      <p className="text-white text-sm font-mono font-medium">{formatDateShort(activeBudget.date_fin)}</p>
                    </div>
                  </div>
                  <div className="absolute bottom-6 left-6 text-left">
                    <p className="text-white/50 text-[10px] uppercase tracking-widest mb-0.5">Montant restant</p>
                    <p className="text-white text-xl font-bold tracking-tight">{formatCFA(activeBudget.montant_restant ?? (parseInt(activeBudget.budget || '0', 10) - (budgetDepts.reduce((s, d) => s + parseInt(d.montant_utilise || '0', 10), 0) + budgetPersonnels.reduce((s, p) => s + parseInt(p.montant_utilise || '0', 10), 0))).toString())}</p>
                  </div>
                  <div className="absolute bottom-6 right-6 text-right">
                    <p className="text-white/50 text-[10px] uppercase tracking-widest mb-0.5">Budget total</p>
                    <p className="text-white text-xl font-bold tracking-tight">{formatCFA(activeBudget.budget)}</p>
                  </div>
                  <div className="absolute top-6 right-6">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 text-white text-xs font-semibold backdrop-blur-sm border border-white/10"><Calendar className="w-3 h-3" />{activeBudget.annee}</span>
                  </div>
                </div>

                {/* Statut badge sous la carte */}
                <div className="flex items-center justify-center mt-4 gap-3">
                  {activeBudget.est_cloture ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm font-medium border border-gray-200"><Lock className="w-3.5 h-3.5" />Clôturé</span>
                  ) : activeBudget.est_active ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-sm font-medium border border-green-200"><ShieldCheck className="w-3.5 h-3.5" />Actif</span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-sm font-medium border border-amber-200"><TrendingUp className="w-3.5 h-3.5" />Inactif</span>
                  )}
                </div>
              </div>

              {/* Détails */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-white border border-[#e5e5e5] text-center">
                  <p className="text-xs text-[#A5A6A5] uppercase tracking-wide mb-1">Date début</p>
                  <p className="text-sm font-semibold text-[#565556]">{formatDateLong(activeBudget.date_debut)}</p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-[#e5e5e5] text-center">
                  <p className="text-xs text-[#A5A6A5] uppercase tracking-wide mb-1">Date fin</p>
                  <p className="text-sm font-semibold text-[#565556]">{formatDateLong(activeBudget.date_fin)}</p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-[#e5e5e5] text-center">
                  <p className="text-xs text-[#A5A6A5] uppercase tracking-wide mb-1">Identifiant</p>
                  <p className="text-sm font-semibold text-[#565556] font-mono">{activeBudget.identifiant_entreprise}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2">
                {!activeBudget.est_active && !activeBudget.est_cloture && (
                  <button onClick={() => handleActiver(activeBudget)} disabled={actionLoadingId === activeBudget.id} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-60">
                    {actionLoadingId === activeBudget.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />}Activer
                  </button>
                )}
                {activeBudget.est_active && !activeBudget.est_cloture && (
                  <button onClick={() => handleCloturer(activeBudget)} disabled={actionLoadingId === activeBudget.id} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-white text-sm font-medium hover:bg-gray-900 transition-colors disabled:opacity-60">
                    {actionLoadingId === activeBudget.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}Clôturer
                  </button>
                )}
                {!activeBudget.est_cloture && (
                  <button onClick={() => openEdit(activeBudget)} disabled={actionLoadingId === activeBudget.id} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#e5e5e5] text-[#565556] hover:bg-[#f4f4f4] text-sm font-medium transition-colors disabled:opacity-60">
                    <Pencil className="w-4 h-4" />Modifier
                  </button>
                )}
                {!activeBudget.est_active && (
                  <button onClick={() => openDelete(activeBudget)} disabled={actionLoadingId === activeBudget.id} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium transition-colors disabled:opacity-60">
                    <Trash2 className="w-4 h-4" />Supprimer
                  </button>
                )}
                {!activeBudget.est_cloture && (
                  <>
                    <button onClick={() => openAdj('augmenter', 'annuel')} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-green-200 text-green-700 hover:bg-green-50 text-sm font-medium transition-colors">
                      <Plus className="w-3.5 h-3.5" />Augmenter
                    </button>
                    <button onClick={() => openAdj('diminuer', 'annuel')} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-50 text-sm font-medium transition-colors">
                      <Minus className="w-3.5 h-3.5" />Diminuer
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Colonne droite : Historique */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-[#565556]">Historique des budgets</h3>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {budgets.map((b) => (
                  <button key={b.id} onClick={() => setSelectedId(b.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border text-sm text-left transition-colors cursor-pointer ${b.id === activeBudget.id ? 'bg-[#fafafa] border-[#A11B1B]/20 hover:bg-[#f4f4f4]' : 'bg-white border-[#e5e5e5] hover:bg-[#fafafa]'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${b.est_cloture ? 'bg-gray-400' : b.est_active ? 'bg-green-500' : 'bg-amber-500'}`} />
                      <span className="font-medium text-[#565556]">{b.annee}</span>
                      <span className="text-[#A5A6A5] text-xs">{formatDateLong(b.date_debut)} – {formatDateLong(b.date_fin)}</span>
                    </div>
                    <span className="font-semibold text-[#565556] font-mono">{formatCFA(b.budget)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ========== Allocation du budget ========== */}
          <div className="max-w-5xl mx-auto space-y-4">
            <h3 className="text-sm font-semibold text-[#565556]">Allocation du budget</h3>
            {allocError && <ErrorAlert error={allocError} onDismiss={() => setAllocError('')} />}
            {allocSuccess && <div className="px-3 py-2 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">{allocSuccess}</div>}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Départements */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-[#A5A6A5] uppercase tracking-wide flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />Départements
                </h4>
                {budgetDepts.length === 0 ? (
                  <p className="text-sm text-[#A5A6A5]">Aucun budget département alloué.</p>
                ) : (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                    {budgetDepts.map((bd) => (
                      <div key={bd.id} className="flex items-center justify-between p-3 rounded-lg bg-white border border-[#e5e5e5]">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#A11B1B]/10 flex items-center justify-center text-[#A11B1B] text-xs font-bold">{bd.departement?.nom?.charAt(0) ?? 'D'}</div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-[#565556]">{bd.departement?.nom ?? 'Département'}</p>
                              {bd.bloquer && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200">
                                  <Lock className="w-3 h-3" />Bloqué
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#A5A6A5]">Reste : <span className="font-mono font-medium text-[#565556]">{formatCFA(bd.montant_restant)}</span></p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-[#565556] font-mono">{formatCFA(bd.montant_alloue)}</span>
                          {!activeBudget.est_cloture && (
                            <div className="flex items-center gap-1">
                              {!bd.bloquer && (
                                <>
                                  <button onClick={() => openAdj('augmenter', 'departement', bd.id, bd.departement?.nom)} className="p-1 rounded-md hover:bg-green-50 text-green-600 transition-colors" title="Augmenter"><Plus className="w-3.5 h-3.5" /></button>
                                  <button onClick={() => openAdj('diminuer', 'departement', bd.id, bd.departement?.nom)} className="p-1 rounded-md hover:bg-amber-50 text-amber-600 transition-colors" title="Diminuer"><Minus className="w-3.5 h-3.5" /></button>
                                </>
                              )}
                              <button
                                onClick={() => handleToggleBlockDept(bd.id, bd.bloquer)}
                                disabled={blockLoadingKey === `dept-${bd.id}`}
                                className={`p-1 rounded-md transition-colors ${bd.bloquer ? 'hover:bg-green-50 text-green-600' : 'hover:bg-red-50 text-red-600'}`}
                                title={bd.bloquer ? 'Débloquer' : 'Bloquer'}
                              >
                                {blockLoadingKey === `dept-${bd.id}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : bd.bloquer ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {!activeBudget.est_cloture && (
                  <form onSubmit={handleAllocDept} className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5] space-y-3">
                    <h5 className="text-xs font-semibold text-[#565556]">Allouer à un département</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-[#565556]">Département *</label>
                        <select value={allocDeptId} onChange={(e) => setAllocDeptId(e.target.value)} required className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10 bg-white">
                          <option value="">Choisir…</option>
                          {depts.map((d) => (<option key={d.id} value={d.id}>{d.nom}</option>))}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-[#565556]">Montant (XOF) *</label>
                        <input type="text" inputMode="numeric" placeholder="Ex: 5000000" value={allocDeptMontant} onChange={(e) => setAllocDeptMontant(e.target.value.replace(/\D/g, ''))} required className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10" />
                      </div>
                    </div>
                    <button type="submit" disabled={allocLoading} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#A11B1B] text-white text-sm font-medium hover:bg-[#8a1616] transition-colors disabled:opacity-60">
                      {allocLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}Allouer
                    </button>
                  </form>
                )}
              </div>

              {/* Personnels */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-[#A5A6A5] uppercase tracking-wide flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />Personnels
                </h4>
                {budgetPersonnels.length === 0 ? (
                  <p className="text-sm text-[#A5A6A5]">Aucun budget personnel alloué.</p>
                ) : (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                    {budgetPersonnels.map((bp) => (
                      <div key={bp.id} className="flex items-center justify-between p-3 rounded-lg bg-white border border-[#e5e5e5]">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#A11B1B]/10 flex items-center justify-center text-[#A11B1B] text-xs font-bold">{bp.user?.prenom?.charAt(0) ?? 'P'}{bp.user?.nom?.charAt(0) ?? ''}</div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-[#565556]">{bp.user?.prenom} {bp.user?.nom}</p>
                              {bp.bloquer && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200">
                                  <Lock className="w-3 h-3" />Bloqué
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#A5A6A5]">Reste : <span className="font-mono font-medium text-[#565556]">{formatCFA(bp.montant_restant)}</span></p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-[#565556] font-mono">{formatCFA(bp.montant_alloue)}</span>
                          {!activeBudget.est_cloture && (
                            <div className="flex items-center gap-1">
                              {!bp.bloquer && (
                                <>
                                  <button onClick={() => openAdj('augmenter', 'personnel', bp.id, `${bp.user?.prenom} ${bp.user?.nom}`)} className="p-1 rounded-md hover:bg-green-50 text-green-600 transition-colors" title="Augmenter"><Plus className="w-3.5 h-3.5" /></button>
                                  <button onClick={() => openAdj('diminuer', 'personnel', bp.id, `${bp.user?.prenom} ${bp.user?.nom}`)} className="p-1 rounded-md hover:bg-amber-50 text-amber-600 transition-colors" title="Diminuer"><Minus className="w-3.5 h-3.5" /></button>
                                </>
                              )}
                              <button
                                onClick={() => handleToggleBlockPerso(bp.id, bp.bloquer)}
                                disabled={blockLoadingKey === `perso-${bp.id}`}
                                className={`p-1 rounded-md transition-colors ${bp.bloquer ? 'hover:bg-green-50 text-green-600' : 'hover:bg-red-50 text-red-600'}`}
                                title={bp.bloquer ? 'Débloquer' : 'Bloquer'}
                              >
                                {blockLoadingKey === `perso-${bp.id}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : bp.bloquer ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {!activeBudget.est_cloture && (
                  <form onSubmit={handleAllocPerso} className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5] space-y-3">
                    <h5 className="text-xs font-semibold text-[#565556]">Allouer à un employé</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-[#565556]">Employé *</label>
                        <select value={allocPersoMatricule} onChange={(e) => setAllocPersoMatricule(e.target.value)} required className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10 bg-white">
                          <option value="">Choisir…</option>
                          {employes.map((emp) => (<option key={emp.id} value={emp.matricule}>{emp.prenom} {emp.nom} ({emp.matricule})</option>))}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-[#565556]">Montant (XOF) *</label>
                        <input type="text" inputMode="numeric" placeholder="Ex: 500000" value={allocPersoMontant} onChange={(e) => setAllocPersoMontant(e.target.value.replace(/\D/g, ''))} required className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-[#565556]">Prélever sur département (optionnel)</label>
                      <select value={allocPersoViaDept} onChange={(e) => setAllocPersoViaDept(e.target.value)} className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10 bg-white">
                        <option value="">Budget annuel direct</option>
                        {depts.map((d) => (<option key={d.id} value={d.id}>{d.nom}</option>))}
                      </select>
                    </div>
                    <button type="submit" disabled={allocLoading} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#A11B1B] text-white text-sm font-medium hover:bg-[#8a1616] transition-colors disabled:opacity-60">
                      {allocLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}Allouer
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* ========== Historique des actions (audits) ========== */}
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-[#565556]">Historique des actions</h3>
              {/* Filtres */}
              <div className="flex items-center gap-2">
                <select
                  value={auditActionFilter}
                  onChange={(e) => { setAuditActionFilter(e.target.value); setAuditPage(1); if (activeBudget) loadAudits(activeBudget.reference, 1, e.target.value, auditRoleFilter); }}
                  className="px-2 py-1.5 rounded-lg border border-[#e5e5e5] text-xs text-[#565556] outline-none focus:border-[#A11B1B] bg-white"
                >
                  <option value="">Toutes les actions</option>
                  <option value="CREER_BUDGET_ANNUEL">Créer budget annuel</option>
                  <option value="MODIFIER_BUDGET_ANNUEL">Modifier budget annuel</option>
                  <option value="SUPPRIMER_BUDGET_ANNUEL">Supprimer budget annuel</option>
                  <option value="ACTIVER_BUDGET_ANNUEL">Activer budget annuel</option>
                  <option value="CLOTURER_BUDGET_ANNUEL">Clôturer budget annuel</option>
                  <option value="AUGMENTER_BUDGET_ANNUEL">Augmenter budget annuel</option>
                  <option value="DIMINUER_BUDGET_ANNUEL">Diminuer budget annuel</option>
                  <option value="ALLOUER_BUDGET_DEPARTEMENT">Allouer département</option>
                  <option value="ALLOUER_BUDGET_PERSONNEL">Allouer personnel</option>
                  <option value="AUGMENTER_BUDGET_DEPARTEMENT">Augmenter département</option>
                  <option value="DIMINUER_BUDGET_DEPARTEMENT">Diminuer département</option>
                  <option value="AUGMENTER_BUDGET_PERSONNEL">Augmenter personnel</option>
                  <option value="DIMINUER_BUDGET_PERSONNEL">Diminuer personnel</option>
                  <option value="MODIFIER_BUDGET_PERSONNEL">Modifier personnel</option>
                  <option value="SUPPRIMER_BUDGET_PERSONNEL">Supprimer personnel</option>
                  <option value="BLOQUER_BUDGET_DEPARTEMENT">Bloquer département</option>
                  <option value="DEBLOQUER_BUDGET_DEPARTEMENT">Débloquer département</option>
                  <option value="BLOQUER_BUDGET_PERSONNEL">Bloquer personnel</option>
                  <option value="DEBLOQUER_BUDGET_PERSONNEL">Débloquer personnel</option>
                </select>
                <select
                  value={auditRoleFilter}
                  onChange={(e) => { setAuditRoleFilter(e.target.value); setAuditPage(1); if (activeBudget) loadAudits(activeBudget.reference, 1, auditActionFilter, e.target.value); }}
                  className="px-2 py-1.5 rounded-lg border border-[#e5e5e5] text-xs text-[#565556] outline-none focus:border-[#A11B1B] bg-white"
                >
                  <option value="">Tous les rôles</option>
                  <option value="SUPERADMIN">Superadmin</option>
                  <option value="ADMIN">Admin</option>
                  <option value="MANAGER">Manager</option>
                </select>
              </div>
            </div>
            {auditLoading ? (
              <div className="flex items-center gap-2 text-sm text-[#A5A6A5]"><Loader2 className="w-4 h-4 animate-spin" /><span>Chargement…</span></div>
            ) : audits.length === 0 ? (
              <p className="text-sm text-[#A5A6A5]"><span>Aucune action enregistrée pour ce budget.</span></p>
            ) : (
              <div className="space-y-3">
                {audits.map((a) => {
                  const color = auditActionColor(a.action);
                  const rColor = roleColor(a.role_effectue_par);
                  return (
                    <div key={a.id} className="flex flex-col sm:flex-row sm:items-start gap-3 p-4 rounded-xl bg-white border border-[#e5e5e5] hover:border-[#d0d0d0] transition-colors">
                      {/* Gauche : date + action + rôle */}
                      <div className="sm:w-48 flex-shrink-0 space-y-1.5">
                        <p className="text-xs text-[#A5A6A5]">{formatAuditDate(a.createdAt)}</p>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${color.bg} ${color.text} ${color.border}`}>
                          <span className="text-[10px] font-bold">{color.icon}</span>
                          {auditActionLabel(a.action)}
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border ${rColor.bg} ${rColor.text} ${rColor.border}`}>
                            {a.role_effectue_par}
                          </span>
                          <p className="text-xs text-[#A5A6A5] truncate">{a.effectue_par}</p>
                        </div>
                      </div>

                      {/* Centre : flux + description */}
                      <div className="flex-1 space-y-2 min-w-0">
                        {a.type_source || a.type_destination ? (
                          <div className="flex items-center gap-2 text-xs">
                            <span className="px-2 py-0.5 rounded bg-[#f4f4f4] text-[#565556] font-medium">{typeLabel(a.type_source)}</span>
                            <span className="text-[#A5A6A5]">→</span>
                            <span className="px-2 py-0.5 rounded bg-[#f4f4f4] text-[#565556] font-medium">{typeLabel(a.type_destination)}</span>
                          </div>
                        ) : null}
                        <p className="text-sm text-[#565556] leading-relaxed">{a.description}</p>
                        {a.target_matricule && (
                          <p className="text-xs text-[#A5A6A5]">Matricule : <span className="font-mono text-[#565556]">{a.target_matricule}</span></p>
                        )}
                        {a.target_id != null && (
                          <p className="text-xs text-[#A5A6A5]">ID : <span className="font-mono text-[#565556]">#{a.target_id}</span></p>
                        )}
                      </div>

                      {/* Droite : montants */}
                      <div className="sm:w-44 flex-shrink-0 text-right space-y-1">
                        {a.montant && (
                          <p className="text-sm font-bold text-[#565556] font-mono">{formatCFA(a.montant)}</p>
                        )}
                        {a.montant_avant && (
                          <div className="flex items-center justify-end gap-2 text-xs">
                            <span className="text-[#A5A6A5]">Avant</span>
                            <span className="font-mono text-[#565556] line-through">{formatCFA(a.montant_avant)}</span>
                          </div>
                        )}
                        {a.montant_apres && (
                          <div className="flex items-center justify-end gap-2 text-xs">
                            <span className="text-[#A5A6A5]">Après</span>
                            <span className="font-mono font-semibold text-green-700">{formatCFA(a.montant_apres)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {auditTotal > auditLimit && (
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#A5A6A5]">Page {auditPage} sur {Math.ceil(auditTotal / auditLimit)}</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setAuditPage((p) => Math.max(1, p - 1)); if (activeBudget) loadAudits(activeBudget.reference, Math.max(1, auditPage - 1)); }} disabled={auditPage <= 1} className="px-3 py-1.5 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] hover:bg-[#f4f4f4] disabled:opacity-40 transition-colors">Précédent</button>
                  <button onClick={() => { setAuditPage((p) => p + 1); if (activeBudget) loadAudits(activeBudget.reference, auditPage + 1); }} disabled={auditPage >= Math.ceil(auditTotal / auditLimit)} className="px-3 py-1.5 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] hover:bg-[#f4f4f4] disabled:opacity-40 transition-colors">Suivant</button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Modal création */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#565556] flex items-center gap-2">
                <Wallet className="w-5 h-5 text-[#A11B1B]" />Nouveau budget annuel
              </h3>
              <button onClick={closeCreate} className="p-1 rounded-md hover:bg-[#f4f4f4] text-[#A5A6A5]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="flex flex-col gap-3">
              {createError && <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{createError}</div>}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[#565556]">Année *</label>
                <input type="number" value={annee} onChange={(e) => setAnnee(parseInt(e.target.value, 10))} required className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-[#565556]">Date de début *</label>
                  <input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} required className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-[#565556]">Date de fin *</label>
                  <input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} required className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[#565556]">Montant du budget (XOF) *</label>
                <input type="text" inputMode="numeric" placeholder="Ex: 50000000" value={montant} onChange={(e) => setMontant(e.target.value.replace(/\D/g, ''))} required className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10" />
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={closeCreate} className="px-4 py-2 rounded-lg text-sm font-medium text-[#565556] hover:bg-[#f4f4f4] transition-colors">Annuler</button>
                <button type="submit" disabled={createLoading} className="px-4 py-2 rounded-lg bg-[#A11B1B] text-white text-sm font-medium hover:bg-[#8a1616] transition-colors disabled:opacity-60">
                  {createLoading ? 'Création…' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal édition */}
      {showEdit && activeBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#565556] flex items-center gap-2">
                <Pencil className="w-5 h-5 text-[#A11B1B]" />Modifier le budget
              </h3>
              <button onClick={() => setShowEdit(false)} className="p-1 rounded-md hover:bg-[#f4f4f4] text-[#A5A6A5]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEdit} className="flex flex-col gap-3">
              {editError && <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{editError}</div>}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[#565556]">Année *</label>
                <input type="number" value={editAnnee} onChange={(e) => setEditAnnee(parseInt(e.target.value, 10))} required className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-[#565556]">Date de début *</label>
                  <input type="date" value={editDateDebut} onChange={(e) => setEditDateDebut(e.target.value)} required className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-[#565556]">Date de fin *</label>
                  <input type="date" value={editDateFin} onChange={(e) => setEditDateFin(e.target.value)} required className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[#565556]">Montant du budget (XOF) *</label>
                <input type="text" inputMode="numeric" value={editMontant} onChange={(e) => setEditMontant(e.target.value.replace(/\D/g, ''))} required className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10" />
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setShowEdit(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-[#565556] hover:bg-[#f4f4f4] transition-colors">Annuler</button>
                <button type="submit" disabled={editLoading} className="px-4 py-2 rounded-lg bg-[#A11B1B] text-white text-sm font-medium hover:bg-[#8a1616] transition-colors disabled:opacity-60">
                  {editLoading ? 'Modification…' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Augmenter / Diminuer */}
      {adjModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#565556]">
                {adjModal.type === 'augmenter' ? 'Augmenter' : 'Diminuer'} le budget {adjModal.target === 'annuel' ? 'annuel' : adjModal.target === 'departement' ? 'département' : 'personnel'}
              </h3>
              <button onClick={closeAdj} className="p-1 rounded-md hover:bg-[#f4f4f4] text-[#A5A6A5]"><X className="w-5 h-5" /></button>
            </div>
            {adjModal.label && <p className="text-sm text-[#A5A6A5] mb-4">{adjModal.label}</p>}
            <form onSubmit={handleAdjSubmit} className="flex flex-col gap-3">
              {adjError && <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{adjError}</div>}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[#565556]">Montant (XOF) *</label>
                <input type="text" inputMode="numeric" placeholder="Ex: 1000000" value={adjMontant} onChange={(e) => setAdjMontant(e.target.value.replace(/\D/g, ''))} required className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10" />
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={closeAdj} className="px-4 py-2 rounded-lg text-sm font-medium text-[#565556] hover:bg-[#f4f4f4] transition-colors">Annuler</button>
                <button type="submit" disabled={adjLoading} className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-60 ${adjModal.type === 'augmenter' ? 'bg-green-600 hover:bg-green-700' : 'bg-amber-600 hover:bg-amber-700'}`}>
                  {adjLoading ? 'Traitement…' : adjModal.type === 'augmenter' ? 'Augmenter' : 'Diminuer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal suppression */}
      {showDelete && selectedBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-[#565556] mb-2">Supprimer le budget ?</h3>
            <p className="text-sm text-[#A5A6A5] mb-6">
              Le budget {selectedBudget.annee} ({formatCFA(selectedBudget.budget)}) sera définitivement supprimé.
            </p>
            {deleteError && <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm mb-4">{deleteError}</div>}
            <div className="flex justify-center gap-3">
              <button onClick={() => setShowDelete(false)} className="px-5 py-2.5 rounded-lg text-sm font-medium text-[#565556] hover:bg-[#f4f4f4] transition-colors">Annuler</button>
              <button onClick={handleDelete} disabled={deleteLoading} className="px-5 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-60">
                {deleteLoading ? 'Suppression…' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

