import { useEffect, useState } from 'react';
import {
  Building2, Users, Calendar, Plane, Hotel, Wallet, TrendingUp,
  Loader2, RefreshCw, BarChart3, PieChart, ArrowUp, ArrowDown,
  CheckCircle2, XCircle, AlertCircle, MoreHorizontal,
} from 'lucide-react';
import {
  getGlobalAnalytics,
  type GlobalAnalytics,
} from '../../services/dashboard';
import { getErrorMessage } from '../../lib/api-errors';
import { ErrorAlert } from '../../components/ErrorAlert';

const MOIS_LABELS = [
  'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
  'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'
];

const STATUT_COLORS: Record<string, string> = {
  EN_ATTENTE: 'bg-amber-500',
  APPROUVEE: 'bg-green-500',
  REJETEE: 'bg-red-500',
  ANNULEE: 'bg-gray-400',
  EN_COURS: 'bg-blue-500',
  TERMINEE: 'bg-purple-500',
  CONFIRMEE: 'bg-green-500',
  EMISE: 'bg-blue-500',
  REMBOURSEE: 'bg-purple-500',
};

const STATUT_LABELS: Record<string, string> = {
  EN_ATTENTE: 'En attente',
  APPROUVEE: 'Approuvée',
  REJETEE: 'Rejetée',
  ANNULEE: 'Annulée',
  EN_COURS: 'En cours',
  TERMINEE: 'Terminée',
  CONFIRMEE: 'Confirmée',
  EMISE: 'Émise',
  REMBOURSEE: 'Remboursée',
};

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
  trendValue,
}: {
  title: string;
  value: string | number;
  icon: any;
  color: string;
  trend?: 'up' | 'down';
  trendValue?: string;
}) {
  return (
    <div className="p-6 rounded-xl bg-white border border-[#e5e5e5]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#A5A6A5] mb-1">{title}</p>
          <p className="text-2xl font-bold text-[#565556]">{value}</p>
          {trend && trendValue && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

function StatBarChart({ data, labels }: { data: number[]; labels: string[] }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((value, index) => (
        <div key={index} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full bg-[#A11B1B] rounded-t-sm transition-all"
            style={{ height: `${(value / max) * 100}%` }}
          />
          <span className="text-xs text-[#A5A6A5]">{labels[index]}</span>
        </div>
      ))}
    </div>
  );
}

function StatPieChart({ data }: { data: Array<{ statut: string; count: number }> }) {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  let startAngle = 0;

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
          {data.map((item, index) => {
            const percentage = (item.count / total) * 100;
            const angle = (percentage / 100) * 360;
            const endAngle = startAngle + angle;
            const x1 = 50 + 50 * Math.cos((startAngle * Math.PI) / 180);
            const y1 = 50 + 50 * Math.sin((startAngle * Math.PI) / 180);
            const x2 = 50 + 50 * Math.cos((endAngle * Math.PI) / 180);
            const y2 = 50 + 50 * Math.sin((endAngle * Math.PI) / 180);
            const largeArc = angle > 180 ? 1 : 0;
            const path = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`;
            startAngle = endAngle;
            return (
              <path
                key={index}
                d={path}
                fill={STATUT_COLORS[item.statut] || '#gray'}
                className="hover:opacity-80 transition-opacity"
              />
            );
          })}
        </svg>
      </div>
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div className={`w-3 h-3 rounded-full ${STATUT_COLORS[item.statut] || 'bg-gray-400'}`} />
            <span className="text-[#565556]">{STATUT_LABELS[item.statut] || item.statut}</span>
            <span className="text-[#A5A6A5]">({item.count})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Analytiques() {
  const [analytics, setAnalytics] = useState<GlobalAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await getGlobalAnalytics(selectedYear);
      setAnalytics(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [selectedYear]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#A11B1B]/10 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-[#A11B1B]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#565556]">Analytiques globales</h1>
            <p className="text-sm text-[#A5A6A5]">Statistiques de toutes les entreprises</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10 bg-white"
          >
            {[2024, 2025, 2026, 2027].map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <button onClick={load} disabled={loading} className="p-2 rounded-lg border border-[#e5e5e5] text-[#565556] hover:bg-[#f4f4f4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors" title="Actualiser">
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && <ErrorAlert error={error} onDismiss={() => setError('')} />}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#A11B1B]" />
        </div>
      ) : analytics ? (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              title="Entreprises"
              value={analytics.entreprises.total}
              icon={Building2}
              color="bg-[#A11B1B]"
              trend="up"
              trendValue={`${analytics.entreprises.actives} actives`}
            />
            <StatCard
              title="Utilisateurs"
              value={analytics.utilisateurs.total}
              icon={Users}
              color="bg-blue-600"
            />
            <StatCard
              title="Demandes de voyage"
              value={analytics.demandesVoyage.total}
              icon={Calendar}
              color="bg-green-600"
            />
            <StatCard
              title="Réservations billets"
              value={analytics.reservations.billets.total}
              icon={Plane}
              color="bg-purple-600"
            />
            <StatCard
              title="Budget total"
              value={`${(analytics.budget.annuel.total / 1000000).toFixed(0)}M FCFA`}
              icon={Wallet}
              color="bg-amber-600"
            />
          </div>

          {/* Demandes de voyage */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl bg-white border border-[#e5e5e5]">
              <h3 className="text-lg font-semibold text-[#565556] mb-4">Demandes de voyage par statut</h3>
              <StatPieChart data={analytics.demandesVoyage.parStatut} />
            </div>
            <div className="p-6 rounded-xl bg-white border border-[#e5e5e5]">
              <h3 className="text-lg font-semibold text-[#565556] mb-4">Demandes mensuelles</h3>
              <StatBarChart
                data={analytics.demandesVoyage.mensuelles.map(m => m.count)}
                labels={MOIS_LABELS}
              />
            </div>
          </div>

          {/* Réservations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl bg-white border border-[#e5e5e5]">
              <h3 className="text-lg font-semibold text-[#565556] mb-4">Billets par statut</h3>
              <StatPieChart data={analytics.reservations.billets.parStatut} />
            </div>
            <div className="p-6 rounded-xl bg-white border border-[#e5e5e5]">
              <h3 className="text-lg font-semibold text-[#565556] mb-4">Hôtels par statut</h3>
              <StatPieChart data={analytics.reservations.hotels.parStatut} />
            </div>
          </div>

          {/* Budget */}
          <div className="p-6 rounded-xl bg-white border border-[#e5e5e5]">
            <h3 className="text-lg font-semibold text-[#565556] mb-4">Budget global</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-[#A5A6A5] mb-2">Budget annuel</p>
                <p className="text-2xl font-bold text-[#565556]">{(analytics.budget.annuel.total / 1000000).toFixed(0)}M FCFA</p>
                <p className="text-sm text-green-600 mt-1">Restant: {(analytics.budget.annuel.montant_restant / 1000000).toFixed(0)}M FCFA</p>
              </div>
              <div>
                <p className="text-sm text-[#A5A6A5] mb-2">Budgets départements</p>
                <p className="text-2xl font-bold text-[#565556]">{(analytics.budget.departements.totalAlloue / 1000000).toFixed(0)}M FCFA</p>
                <p className="text-sm text-[#A5A6A5] mt-1">Utilisé: {(analytics.budget.departements.totalUtilise / 1000000).toFixed(0)}M FCFA</p>
              </div>
              <div>
                <p className="text-sm text-[#A5A6A5] mb-2">Budgets personnels</p>
                <p className="text-2xl font-bold text-[#565556]">{(analytics.budget.personnels.totalAlloue / 1000000).toFixed(0)}M FCFA</p>
                <p className="text-sm text-[#A5A6A5] mt-1">Utilisé: {(analytics.budget.personnels.totalUtilise / 1000000).toFixed(0)}M FCFA</p>
              </div>
            </div>
          </div>

          {/* Top entreprises */}
          <div className="p-6 rounded-xl bg-white border border-[#e5e5e5]">
            <h3 className="text-lg font-semibold text-[#565556] mb-4">Top entreprises</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#e5e5e5]">
                    <th className="text-left px-4 py-3 font-medium text-[#565556]">Entreprise</th>
                    <th className="text-left px-4 py-3 font-medium text-[#565556]">Employés</th>
                    <th className="text-left px-4 py-3 font-medium text-[#565556]">Départements</th>
                    <th className="text-left px-4 py-3 font-medium text-[#565556]">Demandes</th>
                    <th className="text-left px-4 py-3 font-medium text-[#565556]">Forfait</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.entreprises.topEmployes.map((entreprise) => (
                    <tr key={entreprise.id} className="border-b border-[#e5e5e5] hover:bg-[#fafafa]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-[#A11B1B]" />
                          <div>
                            <p className="font-medium text-[#565556]">{entreprise.nom}</p>
                            <p className="text-xs text-[#A5A6A5]">{entreprise.identifiant}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#565556]">{entreprise.totalEmployes}</td>
                      <td className="px-4 py-3 text-[#565556]">{entreprise.totalDepartements}</td>
                      <td className="px-4 py-3 text-[#565556]">{entreprise.totalDemandesVoyage}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-[#e5e5e5] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#A11B1B]"
                              style={{
                                width: `${(entreprise.forfait.nombre_user_actuel / entreprise.forfait.nombre_user_autorise) * 100}%`
                              }}
                            />
                          </div>
                          <span className="text-xs text-[#A5A6A5]">
                            {entreprise.forfait.nombre_user_actuel}/{entreprise.forfait.nombre_user_autorise}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Utilisateurs par rôle */}
          <div className="p-6 rounded-xl bg-white border border-[#e5e5e5]">
            <h3 className="text-lg font-semibold text-[#565556] mb-4">Utilisateurs par rôle</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="p-4 rounded-lg bg-[#fafafa]">
                <p className="text-xs text-[#A5A6A5]">Total</p>
                <p className="text-xl font-bold text-[#565556]">{analytics.utilisateurs.total}</p>
              </div>
              <div className="p-4 rounded-lg bg-[#fafafa]">
                <p className="text-xs text-[#A5A6A5]">Managers</p>
                <p className="text-xl font-bold text-[#565556]">{analytics.utilisateurs.managers}</p>
              </div>
              <div className="p-4 rounded-lg bg-[#fafafa]">
                <p className="text-xs text-[#A5A6A5]">Employés</p>
                <p className="text-xl font-bold text-[#565556]">{analytics.utilisateurs.employes}</p>
              </div>
              <div className="p-4 rounded-lg bg-[#fafafa]">
                <p className="text-xs text-[#A5A6A5]">Consultants</p>
                <p className="text-xl font-bold text-[#565556]">{analytics.utilisateurs.consultants}</p>
              </div>
              <div className="p-4 rounded-lg bg-[#fafafa]">
                <p className="text-xs text-[#A5A6A5]">Bloqués</p>
                <p className="text-xl font-bold text-red-600">{analytics.utilisateurs.bloques}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}