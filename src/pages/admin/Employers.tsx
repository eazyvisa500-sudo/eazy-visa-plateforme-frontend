import { useEffect, useMemo, useState } from 'react';
import {
  Search, Loader2, Eye, Pencil, Ban, Unlock, Trash2,
  AlertTriangle, CheckCircle2, X, User, UserPlus, Plus,
} from 'lucide-react';
import {
  getEmployes, updateEmploye, toggleBlockEmploye, deleteEmploye, createEmployes,
  type Employe,
} from '../../services/employes';
import { getDepartements, type Departement } from '../../services/departements';
import { getUser } from '../../services/auth/storage';

interface EmpRow {
  prenom: string; nom: string; email: string; departement: string;
  poste: string; telephone: string; mot_de_passe: string;
  role: 'EMPLOYE' | 'MANAGER' | 'CONSULTANT';
}

function defaultEmp(): EmpRow {
  return { prenom: '', nom: '', email: '', departement: '', poste: '', telephone: '', mot_de_passe: '', role: 'EMPLOYE' };
}

export default function Employers() {
  const user = getUser();
  const entrepriseId = user?.entrepriseId ?? null;

  const [employes, setEmployes] = useState<Employe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Création
  const [showCreate, setShowCreate] = useState(false);
  const [empRows, setEmpRows] = useState<EmpRow[]>([defaultEmp()]);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [depts, setDepts] = useState<Departement[]>([]);
  const [deptsLoading, setDeptsLoading] = useState(false);

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

  useEffect(() => { loadEmployes(); }, []);

  async function loadEmployes() {
    setLoading(true); setError('');
    try {
      const data = await getEmployes();
      setEmployes(data.employes);
    } catch (err: unknown) {
      const msg = (err as Error & { data?: { message?: string } }).data?.message || 'Erreur de chargement';
      setError(msg);
    } finally { setLoading(false); }
  }

  function getDeptName(d: Employe['departement']) {
    return typeof d === 'string' ? d : d.nom;
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employes;
    return employes.filter((e) =>
      e.prenom.toLowerCase().includes(q) || e.nom.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q) || e.matricule.toLowerCase().includes(q) ||
      getDeptName(e.departement).toLowerCase().includes(q) ||
      e.poste.toLowerCase().includes(q) || e.telephone.toLowerCase().includes(q)
    );
  }, [employes, search]);

  function openDetail(emp: Employe) { setSelectedEmploye(emp); setShowDetail(true); }

  function openEdit(emp: Employe) {
    setSelectedEmploye(emp);
    setEditPrenom(emp.prenom); setEditNom(emp.nom); setEditEmail(emp.email);
    setEditDepartement(getDeptName(emp.departement)); setEditPoste(emp.poste); setEditTelephone(emp.telephone);
    setEditRole(emp.role as 'EMPLOYE' | 'MANAGER' | 'CONSULTANT');
    setEditError(''); setShowEdit(true);
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedEmploye) return;
    setEditError(''); setEditLoading(true);
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
      setShowEdit(false); loadEmployes();
    } catch (err: unknown) {
      const msg = (err as Error & { data?: { message?: string } }).data?.message || 'Erreur lors de la modification';
      setEditError(msg);
    } finally { setEditLoading(false); }
  }

  async function handleToggleBlock(emp: Employe) {
    setActionLoadingId(emp.id);
    try { await toggleBlockEmploye(emp.id); loadEmployes(); }
    catch (err: unknown) {
      const msg = (err as Error & { data?: { message?: string } }).data?.message || 'Erreur';
      setError(msg); setTimeout(() => setError(''), 4000);
    } finally { setActionLoadingId(null); }
  }

  function openDelete(emp: Employe) { setSelectedEmploye(emp); setDeleteError(''); setShowDelete(true); }

  async function handleDelete() {
    if (!selectedEmploye) return;
    setDeleteError(''); setDeleteLoading(true);
    try { await deleteEmploye(selectedEmploye.id); setShowDelete(false); loadEmployes(); }
    catch (err: unknown) {
      const msg = (err as Error & { data?: { message?: string } }).data?.message || 'Erreur lors de la suppression';
      setDeleteError(msg);
    } finally { setDeleteLoading(false); }
  }

  function openCreate() {
    setShowCreate(true); setEmpRows([defaultEmp()]); setCreateError(''); setCreateSuccess(null);
    if (entrepriseId) {
      setDeptsLoading(true);
      getDepartements(entrepriseId)
        .then((res) => setDepts(res.departements))
        .catch(() => setDepts([]))
        .finally(() => setDeptsLoading(false));
    }
  }
  function closeCreate() { setShowCreate(false); setEmpRows([defaultEmp()]); setCreateError(''); setCreateSuccess(null); setDepts([]); }

  function updateRow(index: number, patch: Partial<EmpRow>) {
    setEmpRows((prev) => { const next = [...prev]; next[index] = { ...next[index], ...patch }; return next; });
  }
  function addRow() { setEmpRows((prev) => [...prev, defaultEmp()]); }
  function removeRow(index: number) { setEmpRows((prev) => prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)); }

  async function handleCreateEmploye(e: React.FormEvent) {
    e.preventDefault();
    if (!entrepriseId) { setCreateError('Impossible de déterminer votre entreprise.'); return; }
    const validRows = empRows.filter((r) => r.prenom.trim() && r.nom.trim() && r.email.trim() && r.departement.trim() && r.poste.trim() && r.mot_de_passe.trim());
    if (validRows.length === 0) { setCreateError('Remplissez au moins une ligne complète (prénom, nom, email, département, poste, mot de passe).'); return; }
    setCreateError(''); setCreateSuccess(null); setCreateLoading(true);
    try {
      const res = await createEmployes({ entrepriseId, employes: validRows });
      setEmpRows([defaultEmp()]);
      setCreateSuccess(`${res.total_cree} employé(s) créé(s)${res.ignores > 0 ? ` — ${res.ignores} ignoré(s)` : ''}`);
      loadEmployes();
    } catch (err: unknown) {
      const msg = (err as Error & { data?: { message?: string } }).data?.message || 'Erreur lors de la création';
      setCreateError(msg);
    } finally { setCreateLoading(false); }
  }

  const inputCls = 'px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10';
  const btnIcon = 'p-1.5 rounded-md hover:bg-[#f4f4f4] text-[#565556]';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#565556]">Employés</h2>
          <p className="text-sm text-[#A5A6A5] mt-1">Gérez les employés de votre entreprise</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#A11B1B] text-white text-sm font-medium hover:bg-[#8a1616] transition-colors">
          <UserPlus className="w-4 h-4" />Ajouter des employés
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A5A6A5]" />
        <input type="text" placeholder="Rechercher par nom, email, matricule, poste, département…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10 bg-white" />
      </div>

      {error && <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}

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
                <th className="text-left px-4 py-3 font-medium text-[#565556]">Rôle</th>
                <th className="text-left px-4 py-3 font-medium text-[#565556]">Statut</th>
                <th className="text-right px-4 py-3 font-medium text-[#565556]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-[#A5A6A5]"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-[#A5A6A5]">Aucun employé trouvé</td></tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className="border-b border-[#f0f0f0] hover:bg-[#fafafa] transition-colors">
                    <td className="px-4 py-3 text-[#565556] font-medium">{u.prenom} {u.nom}</td>
                    <td className="px-4 py-3 text-[#A5A6A5]">{u.email}</td>
                    <td className="px-4 py-3 text-[#565556] font-mono text-xs">{u.matricule}</td>
                    <td className="px-4 py-3 text-[#565556]">{u.poste}</td>
                    <td className="px-4 py-3 text-[#565556]">{getDeptName(u.departement)}</td>
                    <td className="px-4 py-3"><span className="inline-block px-2 py-0.5 rounded bg-[#f4f4f4] text-xs text-[#565556]">{u.role}</span></td>
                    <td className="px-4 py-3">{u.is_block ? (
                      <span className="inline-flex items-center gap-1 text-xs text-red-600"><Ban className="w-3.5 h-3.5" />Bloqué</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-green-700"><CheckCircle2 className="w-3.5 h-3.5" />Actif</span>
                    )}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openDetail(u)} className={btnIcon} title="Détail"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => openEdit(u)} className={btnIcon} title="Modifier"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleToggleBlock(u)} disabled={actionLoadingId === u.id} className={`p-1.5 rounded-md hover:bg-[#f4f4f4] ${u.is_block ? 'text-green-700' : 'text-red-600'}`} title={u.is_block ? 'Débloquer' : 'Bloquer'}>
                          {actionLoadingId === u.id ? <Loader2 className="w-4 h-4 animate-spin" /> : u.is_block ? <Unlock className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                        </button>
                        <button onClick={() => openDelete(u)} className="p-1.5 rounded-md hover:bg-red-50 text-red-600" title="Supprimer"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal : Création d'employés */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-8">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-[#e5e5e5] flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#565556] flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#A11B1B]" />Ajouter des employés
              </h3>
              <button onClick={closeCreate} className="p-1 rounded-md hover:bg-[#f4f4f4] text-[#A5A6A5]"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateEmploye} className="p-6 space-y-4">
              {createError && <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{createError}</div>}
              {createSuccess && <div className="px-3 py-2 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">{createSuccess}</div>}
              {empRows.map((row, i) => (
                <div key={i} className="p-4 rounded-xl border border-[#e5e5e5] bg-[#fafafa] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#565556]">Employé {i + 1}</span>
                    {empRows.length > 1 && (
                      <button type="button" onClick={() => removeRow(i)} className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 rounded-md transition-colors" title="Supprimer cette ligne"><Trash2 className="w-4 h-4" /></button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-[#565556]">Prénom *</label>
                      <input value={row.prenom} onChange={(e) => updateRow(i, { prenom: e.target.value })} required className={inputCls + ' bg-white'} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-[#565556]">Nom *</label>
                      <input value={row.nom} onChange={(e) => updateRow(i, { nom: e.target.value })} required className={inputCls + ' bg-white'} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-[#565556]">Email *</label>
                      <input type="email" value={row.email} onChange={(e) => updateRow(i, { email: e.target.value })} required className={inputCls + ' bg-white'} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-[#565556]">Téléphone</label>
                      <input value={row.telephone} onChange={(e) => updateRow(i, { telephone: e.target.value })} className={inputCls + ' bg-white'} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-[#565556]">Département *</label>
                      {deptsLoading ? (
                        <div className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#A5A6A5] bg-[#fafafa] flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" />Chargement…</div>
                      ) : depts.length > 0 ? (
                        <select value={row.departement} onChange={(e) => updateRow(i, { departement: e.target.value })} required className={inputCls + ' bg-white'}>
                          <option value="">Choisir…</option>
                          {depts.map((d) => (<option key={d.id} value={d.nom}>{d.nom}</option>))}
                        </select>
                      ) : (
                        <input value={row.departement} onChange={(e) => updateRow(i, { departement: e.target.value })} required placeholder="Saisir le département" className={inputCls + ' bg-white'} />
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-[#565556]">Poste *</label>
                      <input value={row.poste} onChange={(e) => updateRow(i, { poste: e.target.value })} required className={inputCls + ' bg-white'} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-[#565556]">Rôle</label>
                      <select value={row.role} onChange={(e) => updateRow(i, { role: e.target.value as 'EMPLOYE' | 'MANAGER' | 'CONSULTANT' })} className={inputCls + ' bg-white'}>
                        <option value="EMPLOYE">Employé</option>
                        <option value="MANAGER">Manager</option>
                        <option value="CONSULTANT">Consultant</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-[#565556]">Mot de passe *</label>
                    <input type="password" value={row.mot_de_passe} onChange={(e) => updateRow(i, { mot_de_passe: e.target.value })} required className={inputCls + ' bg-white'} />
                  </div>
                </div>
              ))}
              <button type="button" onClick={addRow} className="inline-flex items-center gap-1.5 text-sm font-medium text-[#A11B1B] hover:text-[#8a1616] transition-colors">
                <Plus className="w-4 h-4" />Ajouter une ligne
              </button>
              <div className="flex justify-end gap-2 pt-2 border-t border-[#e5e5e5]">
                <button type="button" onClick={closeCreate} className="px-4 py-2 rounded-lg text-sm font-medium text-[#565556] hover:bg-[#f4f4f4] transition-colors">Annuler</button>
                <button type="submit" disabled={createLoading} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#A11B1B] text-white text-sm font-medium hover:bg-[#8a1616] transition-colors disabled:opacity-60">
                  {createLoading && <Loader2 className="w-4 h-4 animate-spin" />}{createLoading ? 'Création…' : 'Créer les employés'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal : Détail employé */}
      {showDetail && selectedEmploye && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-8">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-[#e5e5e5] flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#565556] flex items-center gap-2"><User className="w-5 h-5 text-[#A11B1B]" />Détails de l'employé</h3>
              <button onClick={() => setShowDetail(false)} className="p-1 rounded-md hover:bg-[#f4f4f4] text-[#A5A6A5]"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#A11B1B]/10 flex items-center justify-center text-[#A11B1B] text-xl font-bold">{selectedEmploye.prenom.charAt(0)}{selectedEmploye.nom.charAt(0)}</div>
                <div>
                  <h4 className="text-xl font-bold text-[#565556]">{selectedEmploye.prenom} {selectedEmploye.nom}</h4>
                  <div className="mt-1 flex items-center gap-2">
                    {selectedEmploye.is_block ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-xs font-medium"><Ban className="w-3.5 h-3.5" />Bloqué</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium"><CheckCircle2 className="w-3.5 h-3.5" />Actif</span>
                    )}
                    <span className="inline-block px-2.5 py-1 rounded-full bg-[#f4f4f4] text-xs text-[#565556] font-medium">{selectedEmploye.role}</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]"><p className="text-xs text-[#A5A6A5] uppercase tracking-wide">Matricule</p><p className="text-base font-semibold text-[#565556] mt-1 font-mono">{selectedEmploye.matricule}</p></div>
                <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]"><p className="text-xs text-[#A5A6A5] uppercase tracking-wide">Email</p><p className="text-base font-semibold text-[#565556] mt-1 break-all">{selectedEmploye.email}</p></div>
                <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]"><p className="text-xs text-[#A5A6A5] uppercase tracking-wide">Téléphone</p><p className="text-base font-semibold text-[#565556] mt-1">{selectedEmploye.telephone || '—'}</p></div>
                <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]"><p className="text-xs text-[#A5A6A5] uppercase tracking-wide">Département</p><p className="text-base font-semibold text-[#565556] mt-1">{getDeptName(selectedEmploye.departement)}</p></div>
                <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]"><p className="text-xs text-[#A5A6A5] uppercase tracking-wide">Poste</p><p className="text-base font-semibold text-[#565556] mt-1">{selectedEmploye.poste}</p></div>
                <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]"><p className="text-xs text-[#A5A6A5] uppercase tracking-wide">Entreprise</p><p className="text-base font-semibold text-[#565556] mt-1">{selectedEmploye.entreprise?.nom ?? '—'}</p><p className="text-xs text-[#A5A6A5] mt-0.5 font-mono">{selectedEmploye.entreprise?.identifiant ?? ''}</p></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]"><p className="text-xs text-[#A5A6A5] uppercase tracking-wide">Créé le</p><p className="text-base font-semibold text-[#565556] mt-1">{new Date(selectedEmploye.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p></div>
                <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]"><p className="text-xs text-[#A5A6A5] uppercase tracking-wide">Mis à jour le</p><p className="text-base font-semibold text-[#565556] mt-1">{new Date(selectedEmploye.updatedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p></div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[#e5e5e5]">
                <button onClick={() => { setShowDetail(false); openEdit(selectedEmploye); }} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-[#565556] hover:bg-[#f4f4f4] transition-colors"><Pencil className="w-4 h-4" />Modifier</button>
                <button onClick={() => { setShowDetail(false); handleToggleBlock(selectedEmploye); }} disabled={actionLoadingId === selectedEmploye.id} className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedEmploye.is_block ? 'text-green-700 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'} disabled:opacity-60`}>{actionLoadingId === selectedEmploye.id ? <Loader2 className="w-4 h-4 animate-spin" /> : selectedEmploye.is_block ? <Unlock className="w-4 h-4" /> : <Ban className="w-4 h-4" />}{selectedEmploye.is_block ? 'Débloquer' : 'Bloquer'}</button>
                <button onClick={() => { setShowDetail(false); openDelete(selectedEmploye); }} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" />Supprimer</button>
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
              <h3 className="text-lg font-semibold text-[#565556] flex items-center gap-2"><Pencil className="w-5 h-5 text-[#A11B1B]" />Modifier l'employé</h3>
              <button onClick={() => setShowEdit(false)} className="p-1 rounded-md hover:bg-[#f4f4f4] text-[#A5A6A5]"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleEdit} className="flex flex-col gap-3">
              {editError && <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{editError}</div>}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1"><label className="text-xs font-medium text-[#565556]">Prénom *</label><input value={editPrenom} onChange={(e) => setEditPrenom(e.target.value)} required className={inputCls} /></div>
                <div className="flex flex-col gap-1"><label className="text-xs font-medium text-[#565556]">Nom *</label><input value={editNom} onChange={(e) => setEditNom(e.target.value)} required className={inputCls} /></div>
              </div>
              <div className="flex flex-col gap-1"><label className="text-xs font-medium text-[#565556]">Email *</label><input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} required className={inputCls} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1"><label className="text-xs font-medium text-[#565556]">Département *</label><input value={editDepartement} onChange={(e) => setEditDepartement(e.target.value)} required className={inputCls} /></div>
                <div className="flex flex-col gap-1"><label className="text-xs font-medium text-[#565556]">Poste *</label><input value={editPoste} onChange={(e) => setEditPoste(e.target.value)} required className={inputCls} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1"><label className="text-xs font-medium text-[#565556]">Téléphone</label><input value={editTelephone} onChange={(e) => setEditTelephone(e.target.value)} className={inputCls} /></div>
                <div className="flex flex-col gap-1"><label className="text-xs font-medium text-[#565556]">Rôle</label>
                  <select value={editRole} onChange={(e) => setEditRole(e.target.value as 'EMPLOYE' | 'MANAGER' | 'CONSULTANT')} className={inputCls + ' bg-white'}>
                    <option value="EMPLOYE">Employé</option><option value="MANAGER">Manager</option><option value="CONSULTANT">Consultant</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setShowEdit(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-[#565556] hover:bg-[#f4f4f4] transition-colors">Annuler</button>
                <button type="submit" disabled={editLoading} className="px-4 py-2 rounded-lg bg-[#A11B1B] text-white text-sm font-medium hover:bg-[#8a1616] transition-colors disabled:opacity-60">{editLoading ? 'Modification…' : 'Enregistrer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal : Suppression */}
      {showDelete && selectedEmploye && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4"><AlertTriangle className="w-6 h-6 text-red-600" /></div>
            <h3 className="text-lg font-semibold text-[#565556] mb-2">Supprimer l'employé ?</h3>
            <p className="text-sm text-[#A5A6A5] mb-6">{selectedEmploye.prenom} {selectedEmploye.nom} ({selectedEmploye.matricule}) sera définitivement supprimé.</p>
            {deleteError && <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm mb-4">{deleteError}</div>}
            <div className="flex justify-center gap-3">
              <button onClick={() => setShowDelete(false)} className="px-5 py-2.5 rounded-lg text-sm font-medium text-[#565556] hover:bg-[#f4f4f4] transition-colors">Annuler</button>
              <button onClick={handleDelete} disabled={deleteLoading} className="px-5 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-60">{deleteLoading ? 'Suppression…' : 'Supprimer'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
