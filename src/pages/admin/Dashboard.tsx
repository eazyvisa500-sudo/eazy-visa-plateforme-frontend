import { useState, useCallback } from 'react';
import { Loader2, Users, Building2, Plane, Hotel, Wallet, TrendingUp, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getDashboardOverview } from '../../services/dashboard';

function formatCFA(v: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(v);
}

export default function Dashboard() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard', selectedYear],
    queryFn: () => getDashboardOverview(selectedYear),
  });

  const handleYearChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(Number(e.target.value));
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#A11B1B]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
        Erreur de chargement des données
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#565556]">Vue d'ensemble</h2>
          <p className="text-sm text-[#A5A6A5] mt-1">Statistiques de votre entreprise</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-[#A5A6A5]">Année :</label>
          <select
            value={selectedYear}
            onChange={handleYearChange}
            className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10 bg-white"
          >
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
            <option value={2027}>2027</option>
          </select>
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 rounded-lg border border-[#e5e5e5] text-[#565556] hover:bg-[#f4f4f4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Actualiser"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white border border-[#e5e5e5]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[#A5A6A5]">Employés</p>
              <p className="text-xl font-bold text-[#565556]">{data.entreprise.totalEmployes}</p>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl bg-white border border-[#e5e5e5]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-purple-50 text-purple-600">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[#A5A6A5]">Départements</p>
              <p className="text-xl font-bold text-[#565556]">{data.entreprise.totalDepartements}</p>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl bg-white border border-[#e5e5e5]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[#A11B1B]/10 text-[#A11B1B]">
              <Plane className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[#A5A6A5]">Billets</p>
              <p className="text-xl font-bold text-[#565556]">{data.reservations.billets.total}</p>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl bg-white border border-[#e5e5e5]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Hotel className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[#A5A6A5]">Hôtels</p>
              <p className="text-xl font-bold text-[#565556]">{data.reservations.hotels.total}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Demandes de voyage */}
      <div className="p-6 rounded-xl bg-white border border-[#e5e5e5]">
        <h3 className="text-lg font-semibold text-[#565556] mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#A11B1B]" />
          Demandes de voyage
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-[#fafafa]">
            <p className="text-xs text-[#A5A6A5]">Total</p>
            <p className="text-2xl font-bold text-[#565556]">{data.demandesVoyage.total}</p>
          </div>
          {data.demandesVoyage.parStatut.map((s) => (
            <div key={s.statut} className="p-4 rounded-lg bg-[#fafafa]">
              <p className="text-xs text-[#A5A6A5]">{s.statut.replace('_', ' ')}</p>
              <p className="text-2xl font-bold text-[#565556]">{s.count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div className="p-6 rounded-xl bg-white border border-[#e5e5e5]">
        <h3 className="text-lg font-semibold text-[#565556] mb-4 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-[#A11B1B]" />
          Budget annuel
        </h3>
        {data.budget.annuel && data.budget.annuel.details.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-blue-50">
                <p className="text-xs text-[#A5A6A5]">Référence</p>
                <p className="text-sm font-bold text-[#565556]">{data.budget.annuel.details[0].reference}</p>
              </div>
              <div className="p-4 rounded-lg bg-purple-50">
                <p className="text-xs text-[#A5A6A5]">Année</p>
                <p className="text-sm font-bold text-[#565556]">{data.budget.annuel.annee}</p>
              </div>
              <div className="p-4 rounded-lg bg-green-50">
                <p className="text-xs text-[#A5A6A5]">Budget total</p>
                <p className="text-sm font-bold text-[#565556]">{formatCFA(data.budget.annuel.budget)}</p>
              </div>
              <div className="p-4 rounded-lg bg-amber-50">
                <p className="text-xs text-[#A5A6A5]">Restant</p>
                <p className="text-sm font-bold text-[#565556]">{formatCFA(data.budget.annuel.montant_restant)}</p>
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-[#A5A6A5]">Aucun budget annuel configuré.</p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Budgets départements */}
          <div>
            <h4 className="text-sm font-semibold text-[#565556] mb-3">Budgets départements</h4>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#A5A6A5]">Total alloué</span>
                <span className="font-medium text-[#565556]">{formatCFA(data.budget.departements.totalAlloue)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#A5A6A5]">Utilisé</span>
                <span className="font-medium text-[#565556]">{formatCFA(data.budget.departements.totalUtilise)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#A5A6A5]">Restant</span>
                <span className="font-medium text-green-700">{formatCFA(data.budget.departements.totalRestant)}</span>
              </div>
            </div>
          </div>

          {/* Budgets personnels */}
          <div>
            <h4 className="text-sm font-semibold text-[#565556] mb-3">Budgets personnels</h4>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#A5A6A5]">Total alloué</span>
                <span className="font-medium text-[#565556]">{formatCFA(data.budget.personnels.totalAlloue)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#A5A6A5]">Utilisé</span>
                <span className="font-medium text-[#565556]">{formatCFA(data.budget.personnels.totalUtilise)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#A5A6A5]">Restant</span>
                <span className="font-medium text-green-700">{formatCFA(data.budget.personnels.totalRestant)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Réservations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-white border border-[#e5e5e5]">
          <h3 className="text-lg font-semibold text-[#565556] mb-4">Billets</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[#A5A6A5]">Total</span>
              <span className="font-medium text-[#565556]">{data.reservations.billets.total}</span>
            </div>
            {data.reservations.billets.parStatut.map((s) => (
              <div key={s.statut} className="flex justify-between text-sm">
                <span className="text-[#A5A6A5]">{s.statut.replace('_', ' ')}</span>
                <span className="font-medium text-[#565556]">{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-xl bg-white border border-[#e5e5e5]">
          <h3 className="text-lg font-semibold text-[#565556] mb-4">Hôtels</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[#A5A6A5]">Total</span>
              <span className="font-medium text-[#565556]">{data.reservations.hotels.total}</span>
            </div>
            {data.reservations.hotels.parStatut.map((s) => (
              <div key={s.statut} className="flex justify-between text-sm">
                <span className="text-[#A5A6A5]">{s.statut.replace('_', ' ')}</span>
                <span className="font-medium text-[#565556]">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
