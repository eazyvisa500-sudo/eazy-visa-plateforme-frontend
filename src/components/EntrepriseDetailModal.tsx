import { useEffect, useState } from 'react';
import {
  X, Building2, CheckCircle2, Lock, Users, Loader2, UserPlus, Plus, Trash2,
  Eye, Pencil, Ban, Unlock, AlertTriangle, User
} from 'lucide-react';
import {
  createEmployes,
  updateEmploye,
  toggleBlockEmploye,
  deleteEmploye,
  type Employe,
} from '../services/employes';
import type { EntrepriseDetail } from '../services/entreprises';
import {
  getDepartementsByEntreprise,
  type Departement,
} from '../services/departements';

interface Props {
  detail: EntrepriseDetail | null;
  loading: boolean;
  onClose: () => void;
  onRefresh: () => void;
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
  };
}

export default function EntrepriseDetailModal({ detail, loading, onClose, onRefresh }: Props) {
  const [showCreateEmp, setShowCreateEmp] = useState(false);

  const [empRows, setEmpRows] = useState<EmpRow[]>([defaultEmp()]);
  const [empLoading, setEmpLoading] = useState(false);
  const [empError, setEmpError] = useState('');
  const [empSuccess, setEmpSuccess] = useState<string | null>(null);

  // Actions employé
  const [selectedEmploye, setSelectedEmploye] = useState<Employe | null>(null);
  const [showEmpDetail, setShowEmpDetail] = useState(false);
  const [showEmpEdit, setShowEmpEdit] = useState(false);
  const [showEmpDelete, setShowEmpDelete] = useState(false);
  const [empActionLoading, setEmpActionLoading] = useState(false);
  const [empActionError, setEmpActionError] = useState('');

  // Départements de l'entreprise
  const [departements, setDepartements] = useState<Departement[]>([]);
  const [depLoading, setDepLoading] = useState(false);

  // Édition employé
  const [editEmpPrenom, setEditEmpPrenom] = useState('');
  const [editEmpNom, setEditEmpNom] = useState('');
  const [editEmpEmail, setEditEmpEmail] = useState('');
  const [editEmpDepartement, setEditEmpDepartement] = useState('');
  const [editEmpPoste, setEditEmpPoste] = useState('');
  const [editEmpTelephone, setEditEmpTelephone] = useState('');
  const [editEmpRole, setEditEmpRole] = useState<'EMPLOYE' | 'MANAGER' | 'CONSULTANT'>('EMPLOYE');

  function updateRow(index: number, patch: Partial<EmpRow>) {
    setEmpRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
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

  async function handleCreateEmploye(e: React.FormEvent) {
    e.preventDefault();
    if (!detail) return;

    const validRows = empRows.filter((r) =>
      r.prenom.trim() && r.nom.trim() && r.email.trim() && r.departement.trim() && r.poste.trim() && r.mot_de_passe.trim()
    );

    if (validRows.length === 0) {
      setEmpError('Remplissez au moins une ligne complète (prénom, nom, email, département, poste, mot de passe).');
      return;
    }

    setEmpError('');
    setEmpSuccess(null);
    setEmpLoading(true);
    try {
      const res = await createEmployes({
        entrepriseId: detail.id,
        employes: validRows,
      });
      setEmpRows([defaultEmp()]);
      setEmpSuccess(`${res.total_cree} employé(s) créé(s)${res.ignores > 0 ? ` — ${res.ignores} ignoré(s)` : ''}`);
      onRefresh();
    } catch (err: unknown) {
      const msg = (err as Error & { data?: { message?: string } }).data?.message || 'Erreur lors de la création';
      setEmpError(msg);
    } finally {
      setEmpLoading(false);
    }
  }

  function closeEmpModal() {
    setShowCreateEmp(false);
    setEmpRows([defaultEmp()]);
    setEmpError('');
    setEmpSuccess(null);
  }

  useEffect(() => {
    if (detail) {
      setDepLoading(true);
      getDepartementsByEntreprise(detail.id)
        .then((res) => setDepartements(res.departements))
        .catch(() => setDepartements([]))
        .finally(() => setDepLoading(false));
    }
  }, [detail?.id]);

  function openEmpDetail(emp: Employe) {
    setSelectedEmploye(emp);
    setShowEmpDetail(true);
  }

  function openEmpEdit(emp: Employe) {
    setSelectedEmploye(emp);
    setEditEmpPrenom(emp.prenom);
    setEditEmpNom(emp.nom);
    setEditEmpEmail(emp.email);
    setEditEmpDepartement(emp.departement.nom);
    setEditEmpPoste(emp.poste);
    setEditEmpTelephone(emp.telephone);
    setEditEmpRole(emp.role as 'EMPLOYE' | 'MANAGER' | 'CONSULTANT');
    setEmpActionError('');
    setShowEmpEdit(true);
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
      onRefresh();
    } catch (err: unknown) {
      const msg = (err as Error & { data?: { message?: string } }).data?.message || 'Erreur lors de la modification';
      setEmpActionError(msg);
    } finally {
      setEmpActionLoading(false);
    }
  }

  async function handleToggleBlock(emp: Employe) {
    setEmpActionLoading(true);
    try {
      await toggleBlockEmploye(emp.id);
      onRefresh();
    } catch (err: unknown) {
      const msg = (err as Error & { data?: { message?: string } }).data?.message || 'Erreur';
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
      onRefresh();
    } catch (err: unknown) {
      const msg = (err as Error & { data?: { message?: string } }).data?.message || 'Erreur lors de la suppression';
      setEmpActionError(msg);
    } finally {
      setEmpActionLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-8">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-[#e5e5e5] flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#565556] flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#A11B1B]" />
            Détails de l'entreprise
          </h3>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-[#f4f4f4] text-[#A5A6A5]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-[#A5A6A5]">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Chargement...
            </div>
          ) : !detail ? (
            <div className="text-center py-12 text-[#A5A6A5] text-sm">Impossible de charger les détails</div>
          ) : (
            <div className="space-y-6">
              {/* Logo + nom */}
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

              {/* Infos entreprise */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                  <p className="text-xs text-[#A5A6A5] uppercase tracking-wide">Identifiant</p>
                  <p className="text-base font-semibold text-[#565556] mt-1 font-mono">{detail.identifiant}</p>
                </div>
                <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                  <p className="text-xs text-[#A5A6A5] uppercase tracking-wide">Adresse</p>
                  <p className="text-base font-semibold text-[#565556] mt-1">{detail.adresse}</p>
                </div>
                <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                  <p className="text-xs text-[#A5A6A5] uppercase tracking-wide">Pays</p>
                  <p className="text-base font-semibold text-[#565556] mt-1">{detail.pays}</p>
                </div>
                <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                  <p className="text-xs text-[#A5A6A5] uppercase tracking-wide">Région</p>
                  <p className="text-base font-semibold text-[#565556] mt-1">{detail.region}</p>
                </div>
                <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                  <p className="text-xs text-[#A5A6A5] uppercase tracking-wide">Ville</p>
                  <p className="text-base font-semibold text-[#565556] mt-1">{detail.ville}</p>
                </div>
                <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                  <p className="text-xs text-[#A5A6A5] uppercase tracking-wide">Statut</p>
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

              {/* Employés + bouton créer */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-[#565556] flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#A11B1B]" />
                    Employés ({detail.users?.length ?? 0})
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
                    Créer des employés
                  </button>
                </div>

                {detail.users && detail.users.length > 0 ? (
                  <div className="overflow-x-auto rounded-xl border border-[#e5e5e5]">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#e5e5e5] bg-[#fafafa]">
                          <th className="text-left px-4 py-2.5 font-medium text-[#565556]">Nom</th>
                          <th className="text-left px-4 py-2.5 font-medium text-[#565556]">Email</th>
                          <th className="text-left px-4 py-2.5 font-medium text-[#565556]">Poste</th>
                          <th className="text-left px-4 py-2.5 font-medium text-[#565556]">Département</th>
                          <th className="text-left px-4 py-2.5 font-medium text-[#565556]">Rôle</th>
                          <th className="text-left px-4 py-2.5 font-medium text-[#565556]">Statut</th>
                          <th className="text-right px-4 py-2.5 font-medium text-[#565556]">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detail.users.map((u) => (
                          <tr key={u.id} className="border-b border-[#f0f0f0]">
                            <td className="px-4 py-2.5 text-[#565556]">{u.prenom} {u.nom}</td>
                            <td className="px-4 py-2.5 text-[#A5A6A5]">{u.email}</td>
                            <td className="px-4 py-2.5 text-[#565556]">{u.poste}</td>
                            <td className="px-4 py-2.5 text-[#565556]">{u.departement.nom}</td>
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
                  <p className="text-sm text-[#A5A6A5] italic">Aucun employé dans cette entreprise</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sous-modal : Créer des employés */}
      {showCreateEmp && detail && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-8">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-[#e5e5e5] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-[#565556] flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-[#A11B1B]" />
                  Créer des employés
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#f4f4f4] text-xs text-[#565556] font-medium">
                  {empRows.length}
                </span>
              </div>
              <button
                onClick={closeEmpModal}
                className="p-1 rounded-md hover:bg-[#f4f4f4] text-[#A5A6A5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEmploye} className="p-6 space-y-4">
              {empSuccess && (
                <div className="px-3 py-2 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {empSuccess}
                </div>
              )}
              {empError && (
                <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
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
                        Employé {i + 1}
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
                        <label className="text-xs font-medium text-[#565556]">Téléphone</label>
                        <input
                          value={row.telephone}
                          onChange={(e) => updateRow(i, { telephone: e.target.value })}
                          className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10 bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-[#565556]">Département *</label>
                        {depLoading ? (
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#e5e5e5] bg-white text-sm text-[#A5A6A5]">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Chargement…
                          </div>
                        ) : departements.length === 0 ? (
                          <div className="px-3 py-2 rounded-lg border border-red-200 bg-red-50 text-xs text-red-600">
                            Aucun département. Créez-en un d'abord.
                          </div>
                        ) : (
                          <select
                            value={row.departement}
                            onChange={(e) => updateRow(i, { departement: e.target.value })}
                            required
                            className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10 bg-white"
                          >
                            <option value="">Choisir…</option>
                            {departements.map((d) => (
                              <option key={d.id} value={d.nom}>{d.nom}</option>
                            ))}
                          </select>
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
                        <label className="text-xs font-medium text-[#565556]">Rôle</label>
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
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addRow}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-[#A5A6A5] text-sm text-[#565556] hover:border-[#A11B1B] hover:text-[#A11B1B] hover:bg-[#A11B1B]/5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Ajouter un autre employé
              </button>

              <div className="flex justify-end gap-3 pt-2 border-t border-[#e5e5e5]">
                <button
                  type="button"
                  onClick={closeEmpModal}
                  className="px-5 py-2.5 rounded-lg text-sm font-medium text-[#565556] hover:bg-[#f4f4f4] transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={empLoading}
                  className="px-5 py-2.5 rounded-lg bg-[#A11B1B] text-white text-sm font-medium hover:bg-[#8a1616] transition-colors disabled:opacity-60"
                >
                  {empLoading ? 'Création…' : `Créer ${empRows.length} employé${empRows.length > 1 ? 's' : ''}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal : Détail employé */}
      {showEmpDetail && selectedEmploye && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#565556] flex items-center gap-2">
                <User className="w-5 h-5 text-[#A11B1B]" />
                Détail de l'employé
              </h3>
              <button
                onClick={() => setShowEmpDetail(false)}
                className="p-1 rounded-md hover:bg-[#f4f4f4] text-[#A5A6A5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-[#fafafa] border border-[#e5e5e5]">
                  <p className="text-xs text-[#A5A6A5] uppercase">Prénom</p>
                  <p className="text-sm font-semibold text-[#565556] mt-0.5">{selectedEmploye.prenom}</p>
                </div>
                <div className="p-3 rounded-lg bg-[#fafafa] border border-[#e5e5e5]">
                  <p className="text-xs text-[#A5A6A5] uppercase">Nom</p>
                  <p className="text-sm font-semibold text-[#565556] mt-0.5">{selectedEmploye.nom}</p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-[#fafafa] border border-[#e5e5e5]">
                <p className="text-xs text-[#A5A6A5] uppercase">Email</p>
                <p className="text-sm font-semibold text-[#565556] mt-0.5">{selectedEmploye.email}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-[#fafafa] border border-[#e5e5e5]">
                  <p className="text-xs text-[#A5A6A5] uppercase">Matricule</p>
                  <p className="text-sm font-semibold text-[#565556] mt-0.5 font-mono">{selectedEmploye.matricule}</p>
                </div>
                <div className="p-3 rounded-lg bg-[#fafafa] border border-[#e5e5e5]">
                  <p className="text-xs text-[#A5A6A5] uppercase">Téléphone</p>
                  <p className="text-sm font-semibold text-[#565556] mt-0.5">{selectedEmploye.telephone || '—'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-[#fafafa] border border-[#e5e5e5]">
                  <p className="text-xs text-[#A5A6A5] uppercase">Département</p>
                  <p className="text-sm font-semibold text-[#565556] mt-0.5">{selectedEmploye.departement.nom}</p>
                </div>
                <div className="p-3 rounded-lg bg-[#fafafa] border border-[#e5e5e5]">
                  <p className="text-xs text-[#A5A6A5] uppercase">Poste</p>
                  <p className="text-sm font-semibold text-[#565556] mt-0.5">{selectedEmploye.poste}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-[#fafafa] border border-[#e5e5e5]">
                  <p className="text-xs text-[#A5A6A5] uppercase">Rôle</p>
                  <p className="text-sm font-semibold text-[#565556] mt-0.5">{selectedEmploye.role}</p>
                </div>
                <div className="p-3 rounded-lg bg-[#fafafa] border border-[#e5e5e5]">
                  <p className="text-xs text-[#A5A6A5] uppercase">Statut</p>
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
            </div>
          </div>
        </div>
      )}

      {/* Modal : Édition employé */}
      {showEmpEdit && selectedEmploye && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#565556] flex items-center gap-2">
                <Pencil className="w-5 h-5 text-[#A11B1B]" />
                Modifier l'employé
              </h3>
              <button
                onClick={() => setShowEmpEdit(false)}
                className="p-1 rounded-md hover:bg-[#f4f4f4] text-[#A5A6A5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditEmploye} className="flex flex-col gap-3">
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
                  {depLoading ? (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#e5e5e5] bg-white text-sm text-[#A5A6A5]">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Chargement…
                    </div>
                  ) : departements.length === 0 ? (
                    <div className="px-3 py-2 rounded-lg border border-red-200 bg-red-50 text-xs text-red-600">
                      Aucun département disponible.
                    </div>
                  ) : (
                    <select
                      value={editEmpDepartement}
                      onChange={(e) => setEditEmpDepartement(e.target.value)}
                      required
                      className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10 bg-white"
                    >
                      <option value="">Choisir…</option>
                      {departements.map((d) => (
                        <option key={d.id} value={d.nom}>{d.nom}</option>
                      ))}
                    </select>
                  )}
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
                  <label className="text-xs font-medium text-[#565556]">Téléphone</label>
                  <input
                    value={editEmpTelephone}
                    onChange={(e) => setEditEmpTelephone(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-[#565556]">Rôle</label>
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
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowEmpEdit(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-[#565556] hover:bg-[#f4f4f4] transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={empActionLoading}
                  className="px-4 py-2 rounded-lg bg-[#A11B1B] text-white text-sm font-medium hover:bg-[#8a1616] transition-colors disabled:opacity-60"
                >
                  {empActionLoading ? 'Modification…' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal : Suppression employé */}
      {showEmpDelete && selectedEmploye && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-[#565556] mb-2">Supprimer l'employé ?</h3>
            <p className="text-sm text-[#A5A6A5] mb-6">
              {selectedEmploye.prenom} {selectedEmploye.nom} ({selectedEmploye.matricule}) sera définitivement supprimé.
            </p>
            {empActionError && (
              <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm mb-4">
                {empActionError}
              </div>
            )}
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowEmpDelete(false)}
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-[#565556] hover:bg-[#f4f4f4] transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteEmploye}
                disabled={empActionLoading}
                className="px-5 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {empActionLoading ? 'Suppression…' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
