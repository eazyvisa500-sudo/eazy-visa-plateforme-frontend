import { useEffect, useState } from 'react';
import {
  Loader2, AlertTriangle, User, Wallet, Lock,
} from 'lucide-react';
import {
  getEmployeeOverview,
  type EmployeeOverview,
} from '../../services/employes';
import { getUser } from '../../services/auth/storage';

function formatCFA(v: string | number | null) {
  if (v == null) return '—';
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(n);
}

export default function VueEnsemble() {
  const user = getUser();
  const [employeeOverview, setEmployeeOverview] = useState<EmployeeOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true); setError('');
    try {
      // console.log('User from localStorage:', user);
      if (user?.matricule) {
        const overview = await getEmployeeOverview(user.matricule);
        setEmployeeOverview(overview);
      } else {
        console.error('Matricule not found in user object:', user);
        setError('Matricule non disponible');
      }
    } catch (err: unknown) {
      console.error('Error loading overview:', err);
      const msg = (err as Error & { data?: { message?: string } }).data?.message || 'Erreur de chargement';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#A11B1B]/10 flex items-center justify-center">
          <User className="w-5 h-5 text-[#A11B1B]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#565556]">Vue d'ensemble</h1>
          <p className="text-sm text-[#A5A6A5]">Statistiques et informations personnelles</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" /><p className="text-sm">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-12 text-[#A5A6A5]">
          <Loader2 className="w-5 h-5 animate-spin" /><span>Chargement…</span>
        </div>
      ) : employeeOverview ? (
        <div className="space-y-4">
          {/* Statistiques */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Demandes */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-blue-800">Demandes de voyage</span>
                <span className="text-2xl font-bold text-blue-700">{employeeOverview.statistiques.demandes.total}</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-blue-600">Approuvées</span>
                  <span className="font-semibold text-blue-800">{employeeOverview.statistiques.demandes.approuvees}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-blue-600">En cours</span>
                  <span className="font-semibold text-blue-800">{employeeOverview.statistiques.demandes.enCours}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-blue-600">Rejetées</span>
                  <span className="font-semibold text-blue-800">{employeeOverview.statistiques.demandes.rejetees}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-blue-600">Annulées</span>
                  <span className="font-semibold text-blue-800">{employeeOverview.statistiques.demandes.annulees}</span>
                </div>
              </div>
            </div>

            {/* Vols */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-purple-800">Vols réservés</span>
                <span className="text-2xl font-bold text-purple-700">{employeeOverview.statistiques.vols.total}</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-purple-600">Confirmés</span>
                  <span className="font-semibold text-purple-800">{employeeOverview.statistiques.vols.confirmes}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-purple-600">En attente</span>
                  <span className="font-semibold text-purple-800">{employeeOverview.statistiques.vols.enAttente}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-purple-600">Annulés</span>
                  <span className="font-semibold text-purple-800">{employeeOverview.statistiques.vols.annules}</span>
                </div>
              </div>
            </div>

            {/* Hôtels */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-emerald-800">Hôtels réservés</span>
                <span className="text-2xl font-bold text-emerald-700">{employeeOverview.statistiques.hotels.total}</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-emerald-600">Confirmés</span>
                  <span className="font-semibold text-emerald-800">{employeeOverview.statistiques.hotels.confirmes}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-emerald-600">En attente</span>
                  <span className="font-semibold text-emerald-800">{employeeOverview.statistiques.hotels.enAttente}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-emerald-600">Annulés</span>
                  <span className="font-semibold text-emerald-800">{employeeOverview.statistiques.hotels.annules}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Budget personnel */}
          {employeeOverview.budgetPersonnel && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#A11B1B]/5 to-[#8a1616]/5 border border-[#A11B1B]/20">
              <h3 className="text-sm font-semibold text-[#565556] mb-3 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-[#A11B1B]" />
                Budget personnel actuel
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-xs text-[#A5A6A5]">Alloué</p>
                  <p className="text-lg font-bold text-[#565556]">{formatCFA(employeeOverview.budgetPersonnel.montant_alloue)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-[#A5A6A5]">Utilisé</p>
                  <p className="text-lg font-bold text-[#A11B1B]">{formatCFA(employeeOverview.budgetPersonnel.montant_utilise)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-[#A5A6A5]">Restant</p>
                  <p className="text-lg font-bold text-emerald-600">{formatCFA(employeeOverview.budgetPersonnel.montant_restant)}</p>
                </div>
              </div>
              {employeeOverview.budgetPersonnel.bloquer && (
                <div className="mt-2 flex items-center gap-1 text-xs text-red-600">
                  <Lock className="w-3 h-3" />
                  <span>Budget bloqué</span>
                </div>
              )}
            </div>
          )}

          {/* Politique */}
          {employeeOverview.politique && (
            <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
              <h3 className="text-sm font-semibold text-[#565556] mb-2">Politique de voyage</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-xs text-[#A5A6A5]">Classe de vol</p>
                  <p className="font-semibold text-[#565556]">{employeeOverview.politique.classe}</p>
                </div>
                <div>
                  <p className="text-xs text-[#A5A6A5]">Catégorie hôtel</p>
                  <p className="font-semibold text-[#565556]">{employeeOverview.politique.hotel} étoiles</p>
                </div>
                <div>
                  <p className="text-xs text-[#A5A6A5]">Politique</p>
                  <p className="font-semibold text-[#565556]">{employeeOverview.politique.politique}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
