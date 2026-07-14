import { useState, useMemo } from 'react';
import { Loader2, Users, Plane, Hotel, Wallet, TrendingUp, Building2, Calendar, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { getDashboardOverview } from '../../services/dashboard';

const COLORS = ['#A11B1B', '#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#6b7280'];

function formatCFA(v: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(v);
}

export default function Analytiques() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard', selectedYear],
    queryFn: () => getDashboardOverview(selectedYear),
  });

  // Prepare data for charts with useMemo - must be called before any conditional returns
  const demandesStatutData = useMemo(() => 
    data?.demandesVoyage?.parStatut?.map(s => ({
      name: s.statut.replace('_', ' '),
      value: s.count,
    })) || [],
    [data?.demandesVoyage?.parStatut]
  );

  const billetsStatutData = useMemo(() => 
    data?.reservations?.billets?.parStatut?.map(s => ({
      name: s.statut.replace('_', ' '),
      value: s.count,
    })) || [],
    [data?.reservations?.billets?.parStatut]
  );

  const hotelsStatutData = useMemo(() => 
    data?.reservations?.hotels?.parStatut?.map(s => ({
      name: s.statut.replace('_', ' '),
      value: s.count,
    })) || [],
    [data?.reservations?.hotels?.parStatut]
  );

  const budgetComparisonData = useMemo(() => {
    if (!data) return [];
    return [
      {
        name: 'Départements',
        alloue: data.budget.departements.totalAlloue,
        utilise: data.budget.departements.totalUtilise,
        restant: data.budget.departements.totalRestant,
      },
      {
        name: 'Personnels',
        alloue: data.budget.personnels.totalAlloue,
        utilise: data.budget.personnels.totalUtilise,
        restant: data.budget.personnels.totalRestant,
      },
    ];
  }, [data?.budget.departements, data?.budget.personnels]);

  const kpiData = useMemo(() => {
    if (!data) return [];
    return [
      { label: 'Employés', value: data.entreprise.totalEmployes, icon: Users, color: 'blue' },
      { label: 'Départements', value: data.entreprise.totalDepartements, icon: Building2, color: 'purple' },
      { label: 'Demandes', value: data.demandesVoyage.total, icon: Calendar, color: 'amber' },
      { label: 'Billets', value: data.reservations.billets.total, icon: Plane, color: 'red' },
      { label: 'Hôtels', value: data.reservations.hotels.total, icon: Hotel, color: 'green' },
    ];
  }, [data?.entreprise, data?.demandesVoyage, data?.reservations]);

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
          <h2 className="text-2xl font-bold text-[#565556]">Analytiques</h2>
          <p className="text-sm text-[#A5A6A5] mt-1">Visualisation détaillée des données de votre entreprise</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-[#A5A6A5]">Année :</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpiData.map((kpi, i) => {
          const Icon = kpi.icon;
          const colorClasses = {
            blue: 'bg-blue-50 text-blue-600',
            purple: 'bg-purple-50 text-purple-600',
            amber: 'bg-amber-50 text-amber-600',
            red: 'bg-[#A11B1B]/10 text-[#A11B1B]',
            green: 'bg-emerald-50 text-emerald-600',
          };
          return (
            <div key={i} className="p-4 rounded-xl bg-white border border-[#e5e5e5]">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-2 rounded-lg ${colorClasses[kpi.color as keyof typeof colorClasses]}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-[#565556]">{kpi.value}</p>
              <p className="text-xs text-[#A5A6A5]">{kpi.label}</p>
            </div>
          );
        })}
      </div>

      {/* Demandes de voyage - Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-white border border-[#e5e5e5]">
          <h3 className="text-lg font-semibold text-[#565556] mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#A11B1B]" />
            Demandes de voyage par statut
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={demandesStatutData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {demandesStatutData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Billets - Pie Chart */}
        <div className="p-6 rounded-xl bg-white border border-[#e5e5e5]">
          <h3 className="text-lg font-semibold text-[#565556] mb-4 flex items-center gap-2">
            <Plane className="w-5 h-5 text-[#A11B1B]" />
            Billets par statut
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={billetsStatutData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {billetsStatutData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hôtels - Pie Chart */}
      <div className="p-6 rounded-xl bg-white border border-[#e5e5e5]">
        <h3 className="text-lg font-semibold text-[#565556] mb-4 flex items-center gap-2">
          <Hotel className="w-5 h-5 text-[#A11B1B]" />
          Réservations hôtels par statut
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={hotelsStatutData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {hotelsStatutData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Budget Comparison - Stacked Bar Chart */}
      <div className="p-6 rounded-xl bg-white border border-[#e5e5e5]">
        <h3 className="text-lg font-semibold text-[#565556] mb-4 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-[#A11B1B]" />
          Comparaison des budgets
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={budgetComparisonData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
            <Tooltip formatter={(value: number) => formatCFA(value)} />
            <Legend />
            <Bar dataKey="alloue" stackId="a" fill="#3b82f6" name="Alloué" />
            <Bar dataKey="utilise" stackId="a" fill="#22c55e" name="Utilisé" />
            <Bar dataKey="restant" stackId="a" fill="#f59e0b" name="Restant" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Budget Details - Line Chart */}
      {data.budget.annuel && data.budget.annuel.details.length > 0 && (
        <div className="p-6 rounded-xl bg-white border border-[#e5e5e5]">
          <h3 className="text-lg font-semibold text-[#565556] mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#A11B1B]" />
            Budget annuel - {data.budget.annuel.annee}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-lg bg-blue-50">
              <p className="text-xs text-[#A5A6A5]">Référence</p>
              <p className="text-sm font-bold text-[#565556]">{data.budget.annuel.details[0].reference}</p>
            </div>
            <div className="p-4 rounded-lg bg-green-50">
              <p className="text-xs text-[#A5A6A5]">Budget total</p>
              <p className="text-sm font-bold text-[#565556]">{formatCFA(data.budget.annuel.budget)}</p>
            </div>
            <div className="p-4 rounded-lg bg-purple-50">
              <p className="text-xs text-[#A5A6A5]">Utilisé total</p>
              <p className="text-sm font-bold text-[#565556]">{formatCFA(data.budget.departements.totalUtilise + data.budget.personnels.totalUtilise)}</p>
            </div>
            <div className="p-4 rounded-lg bg-amber-50">
              <p className="text-xs text-[#A5A6A5]">Restant total</p>
              <p className="text-sm font-bold text-[#565556]">{formatCFA(data.budget.annuel.montant_restant)}</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={budgetComparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
              <Tooltip formatter={(value: number) => formatCFA(value)} />
              <Legend />
              <Bar dataKey="alloue" fill="#3b82f6" name="Alloué" />
              <Bar dataKey="utilise" fill="#22c55e" name="Utilisé" />
              <Bar dataKey="restant" fill="#f59e0b" name="Restant" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Detailed Budget Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-white border border-[#e5e5e5]">
          <h4 className="text-sm font-semibold text-[#565556] mb-4">Budgets départements</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-[#fafafa] rounded-lg">
              <span className="text-sm text-[#A5A6A5]">Total alloué</span>
              <span className="font-bold text-[#565556]">{formatCFA(data.budget.departements.totalAlloue)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-[#fafafa] rounded-lg">
              <span className="text-sm text-[#A5A6A5]">Utilisé</span>
              <span className="font-bold text-[#565556]">{formatCFA(data.budget.departements.totalUtilise)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-sm text-[#A5A6A5]">Restant</span>
              <span className="font-bold text-green-700">{formatCFA(data.budget.departements.totalRestant)}</span>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-[#A5A6A5] mb-1">
                <span>Taux d'utilisation</span>
                <span>{((data.budget.departements.totalUtilise / data.budget.departements.totalAlloue) * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#A11B1B] h-2 rounded-full transition-all"
                  style={{ width: `${(data.budget.departements.totalUtilise / data.budget.departements.totalAlloue) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-white border border-[#e5e5e5]">
          <h4 className="text-sm font-semibold text-[#565556] mb-4">Budgets personnels</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-[#fafafa] rounded-lg">
              <span className="text-sm text-[#A5A6A5]">Total alloué</span>
              <span className="font-bold text-[#565556]">{formatCFA(data.budget.personnels.totalAlloue)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-[#fafafa] rounded-lg">
              <span className="text-sm text-[#A5A6A5]">Utilisé</span>
              <span className="font-bold text-[#565556]">{formatCFA(data.budget.personnels.totalUtilise)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-sm text-[#A5A6A5]">Restant</span>
              <span className="font-bold text-green-700">{formatCFA(data.budget.personnels.totalRestant)}</span>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-[#A5A6A5] mb-1">
                <span>Taux d'utilisation</span>
                <span>{((data.budget.personnels.totalUtilise / data.budget.personnels.totalAlloue) * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#A11B1B] h-2 rounded-full transition-all"
                  style={{ width: `${(data.budget.personnels.totalUtilise / data.budget.personnels.totalAlloue) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
