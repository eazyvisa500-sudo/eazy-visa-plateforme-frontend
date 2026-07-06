import { useEffect, useState } from 'react';
import { Wallet, Loader2, AlertTriangle, RefreshCw, User, TrendingUp, TrendingDown, PiggyBank, Calendar, CheckCircle2, XCircle, History, Lock } from 'lucide-react';
import { getMesBudgets, getBudgetAuditsByEmployee, type MesBudget, type GetMesBudgetsResponse, type BudgetAudit } from '../../services/budgets';

function formatCFA(v: string | number | null) {
  if (v == null) return '—';
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(n);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function percentUsed(used: string, allocated: string) {
  const u = parseFloat(used);
  const a = parseFloat(allocated);
  if (!a) return 0;
  return Math.min(100, Math.round((u / a) * 100));
}

function formatAuditDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function auditActionColor(action: string) {
  if (action.startsWith('CREER')) return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: '+' };
  if (action.startsWith('MODIFIER')) return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: 'M' };
  if (action.startsWith('SUPPRIMER')) return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: '✕' };
  if (action.startsWith('AUGMENTER')) return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: '+' };
  if (action.startsWith('DIMINUER')) return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: '-' };
  if (action.startsWith('ALLOUER')) return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: '→' };
  if (action.startsWith('ACTIVER')) return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: '✓' };
  if (action.startsWith('CLOTURER')) return { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', icon: '✕' };
  return { bg: 'bg-[#f4f4f4]', text: 'text-[#565556]', border: 'border-[#e5e5e5]', icon: '•' };
}

function auditActionLabel(action: string) {
  return action.replace(/_/g, ' ');
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
  const [data, setData] = useState<GetMesBudgetsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Audits
  const [audits, setAudits] = useState<BudgetAudit[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    setAuditError('');
    try {
      const res = await getMesBudgets();
      setData(res);
      if (res.employe?.matricule) {
        setAuditLoading(true);
        try {
          const auditRes = await getBudgetAuditsByEmployee(res.employe.matricule);
          setAudits(auditRes.audits);
        } catch (err: unknown) {
          const msg = (err as Error & { data?: { message?: string } }).data?.message || 'Erreur de chargement des audits';
          setAuditError(msg);
          setAudits([]);
        } finally {
          setAuditLoading(false);
        }
      }
    } catch (err: unknown) {
      const msg = (err as Error & { data?: { message?: string } }).data?.message || 'Erreur de chargement des budgets';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const budgets = data?.budgets ?? [];
  const employe = data?.employe;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#A11B1B]/10 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-[#A11B1B]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#565556]">Mes budgets</h1>
            <p className="text-sm text-[#A5A6A5]">Consultez vos budgets personnels alloués</p>
          </div>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[#565556] hover:bg-[#f4f4f4] transition-colors disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Actualiser
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && !data && (
        <div className="flex items-center justify-center gap-2 py-20 text-[#A5A6A5]">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Chargement de vos budgets…</span>
        </div>
      )}

      {/* Employee info */}
      {employe && (
        <div className="flex items-center gap-4 p-4 rounded-xl bg-white border border-[#e5e5e5]">
          <div className="w-12 h-12 rounded-full bg-[#A11B1B]/10 flex items-center justify-center text-[#A11B1B] font-bold text-sm">
            {employe.prenom[0]}{employe.nom[0]}
          </div>
          <div>
            <p className="text-base font-semibold text-[#565556]">{employe.prenom} {employe.nom}</p>
            <div className="flex items-center gap-2 text-sm text-[#A5A6A5]">
              <span className="font-mono">{employe.matricule}</span>
              <span>•</span>
              <span>{employe.role}</span>
            </div>
          </div>
        </div>
      )}

      {/* Budgets list */}
      {!loading && budgets.length === 0 ? (
        <div className="text-center py-16 rounded-xl bg-white border border-[#e5e5e5]">
          <PiggyBank className="w-12 h-12 text-[#e5e5e5] mx-auto mb-3" />
          <p className="text-base font-medium text-[#565556]">Aucun budget personnel alloué</p>
          <p className="text-sm text-[#A5A6A5] mt-1">Vous n'avez pas encore de budget personnel assigné.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {budgets.map((b) => (
            <BudgetCard key={b.id} budget={b} />
          ))}
        </div>
      )}

      {/* Historique des actions sur le budget */}
      <div className="space-y-3 pt-2">
        <h4 className="text-base font-semibold text-[#565556] flex items-center gap-2">
          <History className="w-5 h-5 text-[#A11B1B]" />
          Historique des actions sur le budget
        </h4>
        {auditError && (
          <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{auditError}</div>
        )}
        {auditLoading ? (
          <div className="flex items-center gap-2 text-sm text-[#A5A6A5]"><Loader2 className="w-4 h-4 animate-spin" /><span>Chargement…</span></div>
        ) : audits.length === 0 ? (
          <p className="text-sm text-[#A5A6A5]"><span>Aucune action budgétaire enregistrée.</span></p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {audits.map((a) => {
              const color = auditActionColor(a.action);
              const rColor = roleColor(a.role_effectue_par);
              return (
                <div key={a.id} className="flex flex-col sm:flex-row sm:items-start gap-3 p-4 rounded-xl bg-white border border-[#e5e5e5] hover:border-[#d0d0d0] transition-colors">
                  <div className="sm:w-44 flex-shrink-0 space-y-1.5">
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
                  </div>
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
      </div>
    </div>
  );
}

function BudgetCard({ budget }: { budget: MesBudget }) {
  const pct = percentUsed(budget.montant_utilise, budget.montant_alloue);
  const remaining = parseFloat(budget.montant_restant);
  const ba = budget.budgetAnnuel;

  return (
    <div className="bg-white rounded-2xl border border-[#e5e5e5] p-5 space-y-5 hover:border-[#d0d0d0] transition-colors">
      {/* Top row: reference + status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-[#f4f4f4] text-[#565556] text-xs font-semibold font-mono">
            {budget.reference}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-[#f4f4f4] text-[#A5A6A5] text-xs font-medium">
            {ba.annee}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {budget.bloquer && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
              <Lock className="w-3 h-3" />Bloqué
            </span>
          )}
          {ba.est_cloture ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
              <XCircle className="w-3 h-3" />Clôturé
            </span>
          ) : ba.est_active ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3 h-3" />Actif
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              Inactif
            </span>
          )}
        </div>
      </div>

      {/* Amounts */}
      <div className="grid grid-cols-3 gap-4">
        <AmountBox icon={<PiggyBank className="w-4 h-4 text-blue-600" />} label="Alloué" value={formatCFA(budget.montant_alloue)} color="blue" />
        <AmountBox icon={<TrendingUp className="w-4 h-4 text-amber-600" />} label="Utilisé" value={formatCFA(budget.montant_utilise)} color="amber" />
        <AmountBox icon={<TrendingDown className="w-4 h-4 text-emerald-600" />} label="Restant" value={formatCFA(budget.montant_restant)} color="emerald" />
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#A5A6A5]">Utilisation</span>
          <span className="font-semibold text-[#565556]">{pct}%</span>
        </div>
        <div className="h-2.5 rounded-full bg-[#f4f4f4] overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        {remaining < 0 && (
          <p className="text-xs text-red-600 font-medium">Dépassement de {formatCFA(Math.abs(remaining))}</p>
        )}
      </div>

      {/* Annual budget details */}
      <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5] space-y-2">
        <p className="text-xs font-semibold text-[#565556] uppercase tracking-wide">Budget annuel associé</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2 text-[#565556]">
            <Calendar className="w-3.5 h-3.5 text-[#A5A6A5]" />
            <span>{formatDate(ba.date_debut)} → {formatDate(ba.date_fin)}</span>
          </div>
          <div className="flex items-center gap-2 text-[#565556]">
            <Wallet className="w-3.5 h-3.5 text-[#A5A6A5]" />
            <span>Budget total : <span className="font-semibold font-mono">{formatCFA(ba.budget)}</span></span>
          </div>
          <div className="flex items-center gap-2 text-[#565556]">
            <User className="w-3.5 h-3.5 text-[#A5A6A5]" />
            <span>Entreprise : <span className="font-mono">{ba.identifiant_entreprise}</span></span>
          </div>
          <div className="flex items-center gap-2 text-[#565556]">
            <span className="text-xs text-[#A5A6A5]">Alloué le</span>
            <span>{formatDate(budget.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AmountBox({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: 'blue' | 'amber' | 'emerald' }) {
  const bgMap = { blue: 'bg-blue-50', amber: 'bg-amber-50', emerald: 'bg-emerald-50' };
  return (
    <div className={`p-3 rounded-xl ${bgMap[color]} space-y-1`}>
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-xs font-medium text-[#A5A6A5]">{label}</span>
      </div>
      <p className="text-base font-bold text-[#565556] font-mono">{value}</p>
    </div>
  );
}

