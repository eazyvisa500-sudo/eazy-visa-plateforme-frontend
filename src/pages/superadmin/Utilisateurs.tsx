import { useEffect, useMemo, useState } from 'react';
import {
  Search, Loader2, Eye, Pencil, Ban, Unlock, Trash2,
  AlertTriangle, CheckCircle2, X, User, Building2
} from 'lucide-react';
import {
  getEmployes,
  updateEmploye,
  toggleBlockEmploye,
  deleteEmploye,
  type Employe,
} from '../../services/employes';

export default function Utilisateurs() {
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Détail
  const [selectedEmploye, setSelectedEmploye] = useState<Employe | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  // Édition
  const [showEdit, setShowEdit] = useState(false);
  const [editPrenom, setEditPrenom] = useState('');
  const [editNom, setEditNom] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editDepartement, setEditDepartement] = useState('');
  const [editPoste, setEditPoste] = useState('');
  const [editTelephone, setEditTelephone] = useState('');
  const [editRole, setEditRole] = useState<'EMPLOYE' | 'MANAGER' | 'CONSULTANT'>('EMPLOYE');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Suppression
  const [showDelete, setShowDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Action loading (bloquer)
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  useEffect(() => {
    loadEmployes();
  }, []);

  async function loadEmployes() {
    setLoading(true);
    setError('');
    try {
      const data = await getEmployes();
      setEmployes(data.employes);
    } catch (err: unknown) {
      const msg = (err as Error & { data?: { message?: string } }).data?.message || 'Erreur de chargement';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employes;
    return employes.filter((e) =>
      e.prenom.toLowerCase().includes(q) ||
      e.nom.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q) ||
      e.matricule.toLowerCase().includes(q) ||
      e.departement.nom.toLowerCase().includes(q) ||
      e.poste.toLowerCase().includes(q) ||
      e.telephone.toLowerCase().includes(q) ||
      e.entreprise.nom.toLowerCase().includes(q) ||
      e.entreprise.identifiant.toLowerCase().includes(q)
    );
  }, [employes, search]);

  function openDetail(emp: Employe) {
    setSelectedEmploye(emp);
    setShowDetail(true);
  }

  function openEdit(emp: Employe) {
    setSelectedEmploye(emp);
    setEditPrenom(emp.prenom);
    setEditNom(emp.nom);
    setEditEmail(emp.email);
    setEditDepartement(emp.departement.nom);
    setEditPoste(emp.poste);
    setEditTelephone(emp.telephone);
    setEditRole(emp.role as 'EMPLOYE' | 'MANAGER' | 'CONSULTANT');
    setEditError('');
    setShowEdit(true);
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedEmploye) return;
    setEditError('');
    setEditLoading(true);
    try {
      const payload: Parameters<typeof updateEmploye>[1] = {};
      if (editPrenom.trim()) payload.prenom = editPrenom.trim();
      if (editNom.trim()) payload.nom = editNom.trim();
      if (editEmail.trim()) payload.email = editEmail.trim();
      if (editDepartement.trim()) payload.departement = editDepartement.trim();
      if (editPoste.trim()) payload.poste = editPoste.trim();
      if (editTelephone.trim()) payload.telephone = editTelephone.trim();
      payload.role = editRole;
      await updateEmploye(selectedEmploye.id, payload);
      setShowEdit(false);
      loadEmployes();
    } catch (err: unknown) {
      const msg = (err as Error & { data?: { message?: string } }).data?.message || 'Erreur lors de la modification';
      setEditError(msg);
    } finally {
      setEditLoading(false);
    }
  }

  async function handleToggleBlock(emp: Employe) {
    setActionLoadingId(emp.id);
    try {
      await toggleBlockEmploye(emp.id);
      loadEmployes();
    } catch (err: unknown) {
      const msg = (err as Error & { data?: { message?: string } }).data?.message || 'Erreur';
      setError(msg);
      setTimeout(() => setError(''), 4000);
    } finally {
      setActionLoadingId(null);
    }
  }

  function openDelete(emp: Employe) {
    setSelectedEmploye(emp);
    setDeleteError('');
    setShowDelete(true);
  }

  async function handleDelete() {
    if (!selectedEmploye) return;
    setDeleteError('');
    setDeleteLoading(true);
    try {
      await deleteEmploye(selectedEmploye.id);
      setShowDelete(false);
      loadEmployes();
    } catch (err: unknown) {
      const msg = (err as Error & { data?: { message?: string } }).data?.message || 'Erreur lors de la suppression';
      setDeleteError(msg);
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#565556]">Utilisateurs</h2>
          <p className="text-sm text-[#A5A6A5] mt-1">Gérez tous les employés et managers de la plateforme</p>
        </div>
      </div>

      {/* Recherche */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A5A6A5]" />
        <input
          type="text"
          placeholder="Rechercher par nom, email, matricule, poste, département…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10 bg-white"
        />
      </div>

      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-[#e5e5e5] overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e5e5e5] bg-[#fafafa]">
                <th className="text-left px-4 py-3 font-medium text-[#565556]">Nom</th>
                <th className="text-left px-4 py-3 font-medium text-[#565556]">Email</th>
                <th className="text-left px-4 py-3 font-medium text-[#565556]">Matricule</th>
                <th className="text-left px-4 py-3 font-medium text-[#565556]">Poste</th>
                <th className="text-left px-4 py-3 font-medium text-[#565556]">Département</th>
                <th className="text-left px-4 py-3 font-medium text-[#565556]">Entreprise</th>
                <th className="text-left px-4 py-3 font-medium text-[#565556]">Rôle</th>
                <th className="text-left px-4 py-3 font-medium text-[#565556]">Statut</th>
                <th className="text-right px-4 py-3 font-medium text-[#565556]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-[#A5A6A5]">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-[#A5A6A5]">
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className="border-b border-[#f0f0f0] hover:bg-[#fafafa] transition-colors">
                    <td className="px-4 py-3 text-[#565556] font-medium">{u.prenom} {u.nom}</td>
                    <td className="px-4 py-3 text-[#A5A6A5]">{u.email}</td>
                    <td className="px-4 py-3 text-[#565556] font-mono text-xs">{u.matricule}</td>
                    <td className="px-4 py-3 text-[#565556]">{u.poste}</td>
                    <td className="px-4 py-3 text-[#565556]">{u.departement.nom}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-[#565556] font-medium text-xs">{u.entreprise.nom}</span>
                        <span className="text-[#A5A6A5] text-[10px] font-mono">{u.entreprise.identifiant}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded bg-[#f4f4f4] text-xs text-[#565556]">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.is_block ? (
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
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openDetail(u)}
                          className="p-1.5 rounded-md hover:bg-[#f4f4f4] text-[#565556]"
                          title="Détail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEdit(u)}
                          className="p-1.5 rounded-md hover:bg-[#f4f4f4] text-[#565556]"
                          title="Modifier"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleBlock(u)}
                          disabled={actionLoadingId === u.id}
                          className={`p-1.5 rounded-md hover:bg-[#f4f4f4] ${u.is_block ? 'text-green-700' : 'text-red-600'}`}
                          title={u.is_block ? 'Débloquer' : 'Bloquer'}
                        >
                          {actionLoadingId === u.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : u.is_block ? (
                            <Unlock className="w-4 h-4" />
                          ) : (
                            <Ban className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => openDelete(u)}
                          className="p-1.5 rounded-md hover:bg-red-50 text-red-600"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal : Détail employé (grand) */}
      {showDetail && selectedEmploye && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-8">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-[#e5e5e5] flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#565556] flex items-center gap-2">
                <User className="w-5 h-5 text-[#A11B1B]" />
                Détails de l'employé
              </h3>
              <button onClick={() => setShowDetail(false)} className="p-1 rounded-md hover:bg-[#f4f4f4] text-[#A5A6A5]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* En-tête */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#A11B1B]/10 flex items-center justify-center text-[#A11B1B] text-xl font-bold">
                  {selectedEmploye.prenom.charAt(0)}{selectedEmploye.nom.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-[#565556]">{selectedEmploye.prenom} {selectedEmploye.nom}</h4>
                  <div className="mt-1 flex items-center gap-2">
                    {selectedEmploye.is_block ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-xs font-medium">
                        <Ban className="w-3.5 h-3.5" />
                        Bloqué
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Actif
                      </span>
                    )}
                    <span className="inline-block px-2.5 py-1 rounded-full bg-[#f4f4f4] text-xs text-[#565556] font-medium">
                      {selectedEmploye.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Infos grille */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                  <p className="text-xs text-[#A5A6A5] uppercase tracking-wide">Matricule</p>
                  <p className="text-base font-semibold text-[#565556] mt-1 font-mono">{selectedEmploye.matricule}</p>
                </div>
                <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                  <p className="text-xs text-[#A5A6A5] uppercase tracking-wide">Email</p>
                  <p className="text-base font-semibold text-[#565556] mt-1 break-all">{selectedEmploye.email}</p>
                </div>
                <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                  <p className="text-xs text-[#A5A6A5] uppercase tracking-wide">Téléphone</p>
                  <p className="text-base font-semibold text-[#565556] mt-1">{selectedEmploye.telephone || '—'}</p>
                </div>
                <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                  <p className="text-xs text-[#A5A6A5] uppercase tracking-wide">Département</p>
                  <p className="text-base font-semibold text-[#565556] mt-1">{selectedEmploye.departement.nom}</p>
                </div>
                <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                  <p className="text-xs text-[#A5A6A5] uppercase tracking-wide">Poste</p>
                  <p className="text-base font-semibold text-[#565556] mt-1">{selectedEmploye.poste}</p>
                </div>
                <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#A5A6A5]" />
                    <p className="text-xs text-[#A5A6A5] uppercase tracking-wide">Entreprise</p>
                  </div>
                  <p className="text-base font-semibold text-[#565556] mt-1">{selectedEmploye.entreprise.nom}</p>
                  <p className="text-xs text-[#A5A6A5] font-mono mt-0.5">{selectedEmploye.entreprise.identifiant}</p>
                  {selectedEmploye.entreprise.telephone && (
                    <p className="text-xs text-[#565556] mt-0.5">{selectedEmploye.entreprise.telephone}</p>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                  <p className="text-xs text-[#A5A6A5] uppercase tracking-wide">Créé le</p>
                  <p className="text-base font-semibold text-[#565556] mt-1">
                    {new Date(selectedEmploye.createdAt).toLocaleDateString('fr-FR', {
                      day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                  <p className="text-xs text-[#A5A6A5] uppercase tracking-wide">Mis à jour le</p>
                  <p className="text-base font-semibold text-[#565556] mt-1">
                    {new Date(selectedEmploye.updatedAt).toLocaleDateString('fr-FR', {
                      day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {/* Actions dans le modal détail */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[#e5e5e5]">
                <button
                  onClick={() => { setShowDetail(false); openEdit(selectedEmploye); }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-[#565556] hover:bg-[#f4f4f4] transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  Modifier
                </button>
                <button
                  onClick={() => { setShowDetail(false); handleToggleBlock(selectedEmploye); }}
                  disabled={actionLoadingId === selectedEmploye.id}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedEmploye.is_block
                      ? 'text-green-700 hover:bg-green-50'
                      : 'text-red-600 hover:bg-red-50'
                  } disabled:opacity-60`}
                >
                  {actionLoadingId === selectedEmploye.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : selectedEmploye.is_block ? (
                    <Unlock className="w-4 h-4" />
                  ) : (
                    <Ban className="w-4 h-4" />
                  )}
                  {selectedEmploye.is_block ? 'Débloquer' : 'Bloquer'}
                </button>
                <button
                  onClick={() => { setShowDetail(false); openDelete(selectedEmploye); }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal : Édition */}
      {showEdit && selectedEmploye && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#565556] flex items-center gap-2">
                <Pencil className="w-5 h-5 text-[#A11B1B]" />
                Modifier l'employé
              </h3>
              <button onClick={() => setShowEdit(false)} className="p-1 rounded-md hover:bg-[#f4f4f4] text-[#A5A6A5]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEdit} className="flex flex-col gap-3">
              {editError && (
                <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                  {editError}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-[#565556]">Prénom *</label>
                  <input
                    value={editPrenom}
                    onChange={(e) => setEditPrenom(e.target.value)}
                    required
                    className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-[#565556]">Nom *</label>
                  <input
                    value={editNom}
                    onChange={(e) => setEditNom(e.target.value)}
                    required
                    className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[#565556]">Email *</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  required
                  className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-[#565556]">Département *</label>
                  <input
                    value={editDepartement}
                    onChange={(e) => setEditDepartement(e.target.value)}
                    required
                    className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-[#565556]">Poste *</label>
                  <input
                    value={editPoste}
                    onChange={(e) => setEditPoste(e.target.value)}
                    required
                    className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-[#565556]">Téléphone</label>
                  <input
                    value={editTelephone}
                    onChange={(e) => setEditTelephone(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-[#565556]">Rôle</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as 'EMPLOYE' | 'MANAGER' | 'CONSULTANT')}
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
                  onClick={() => setShowEdit(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-[#565556] hover:bg-[#f4f4f4] transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-4 py-2 rounded-lg bg-[#A11B1B] text-white text-sm font-medium hover:bg-[#8a1616] transition-colors disabled:opacity-60"
                >
                  {editLoading ? 'Modification…' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal : Suppression */}
      {showDelete && selectedEmploye && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-[#565556] mb-2">Supprimer l'employé ?</h3>
            <p className="text-sm text-[#A5A6A5] mb-6">
              {selectedEmploye.prenom} {selectedEmploye.nom} ({selectedEmploye.matricule}) sera définitivement supprimé.
            </p>
            {deleteError && (
              <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm mb-4">
                {deleteError}
              </div>
            )}
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowDelete(false)}
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-[#565556] hover:bg-[#f4f4f4] transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="px-5 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {deleteLoading ? 'Suppression…' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
