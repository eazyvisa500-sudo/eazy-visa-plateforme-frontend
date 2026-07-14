import { useEffect, useMemo, useState } from 'react';
import {
  Search, Loader2, Plus, Pencil, Trash2, AlertTriangle,
  X, Check, UserPlus, RefreshCw,
} from 'lucide-react';
import {
  getPolitiques, createPolitique, updatePolitique, deletePolitique,
  type Politique, type CreatePolitiquePayload, type UpdatePolitiquePayload,
} from '../../services/politiques';
import { getEmployes, type Employe } from '../../services/employes';

const inputCls = 'px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10';

function classBadge(label: string, active: boolean) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${active ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
      {active ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}{label}
    </span>
  );
}

function hotelStars(n: number) {
  if (n <= 0) return <span className="text-xs text-gray-400">Aucun</span>;
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-500 text-xs">
      {Array.from({ length: n }).map((_, i) => (
        <span key={i}>★</span>
      ))}
      <span className="text-[#A5A6A5] ml-1">({n})</span>
    </span>
  );
}

export default function AdminPolitiques() {
  const [politiques, setPolitiques] = useState<Politique[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Employés pour le dropdown
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [empLoading, setEmpLoading] = useState(false);

  // Create
  const [showCreate, setShowCreate] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createPayload, setCreatePayload] = useState<CreatePolitiquePayload>({ matricule: '', y: true, w: false, j: false, f: false, hotel: 3 });

  // Edit
  const [showEdit, setShowEdit] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [selected, setSelected] = useState<Politique | null>(null);
  const [editPayload, setEditPayload] = useState<UpdatePolitiquePayload>({ y: true, w: false, j: false, f: false, hotel: 3 });

  // Delete
  const [showDelete, setShowDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  async function load() {
    setLoading(true); setError('');
    try {
      const res = await getPolitiques();
      setPolitiques(res.politiques);
    } catch (err: unknown) {
      const msg = (err as Error & { data?: { message?: string } }).data?.message || 'Erreur de chargement';
      setError(msg);
    } finally { setLoading(false); }
  }

  async function loadEmployes() {
    setEmpLoading(true);
    try {
      const res = await getEmployes();
      setEmployes(res.employes);
    } catch { setEmployes([]); }
    finally { setEmpLoading(false); }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return politiques;
    return politiques.filter((p) => {
      const fullName = `${p.user?.prenom ?? ''} ${p.user?.nom ?? ''}`.toLowerCase();
      return fullName.includes(q) || p.matricule.toLowerCase().includes(q);
    });
  }, [politiques, search]);

  // créer
  function openCreate() {
    setShowCreate(true);
    setCreateError('');
    setCreatePayload({ matricule: '', y: true, w: false, j: false, f: false, hotel: 3 });
    if (employes.length === 0) loadEmployes();
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!createPayload.matricule) { setCreateError('Sélectionnez un employé.'); return; }
    setCreateError(''); setCreateLoading(true);
    try {
      await createPolitique(createPayload);
      setShowCreate(false);
      load();
    } catch (err: unknown) {
      const msg = (err as Error & { data?: { message?: string } }).data?.message || 'Erreur lors de la création';
      setCreateError(msg);
    } finally { setCreateLoading(false); }
  }

  // modifier
  function openEdit(p: Politique) {
    setSelected(p);
    setEditPayload({ y: p.y, w: p.w, j: p.j, f: p.f, hotel: p.hotel });
    setEditError('');
    setShowEdit(true);
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setEditError(''); setEditLoading(true);
    try {
      await updatePolitique(selected.matricule, editPayload);
      setShowEdit(false);
      load();
    } catch (err: unknown) {
      const msg = (err as Error & { data?: { message?: string } }).data?.message || 'Erreur lors de la modification';
      setEditError(msg);
    } finally { setEditLoading(false); }
  }

  // supprimer
  function openDelete(p: Politique) { setSelected(p); setDeleteError(''); setShowDelete(true); }

  async function handleDelete() {
    if (!selected) return;
    setDeleteError(''); setDeleteLoading(true);
    try {
      await deletePolitique(selected.matricule);
      setShowDelete(false);
      load();
    } catch (err: unknown) {
      const msg = (err as Error & { data?: { message?: string } }).data?.message || 'Erreur lors de la suppression';
      setDeleteError(msg);
    } finally { setDeleteLoading(false); }
  }

  const availableEmployes = useMemo(() => {
    const withPolicy = new Set(politiques.map((p) => p.matricule));
    return employes.filter((e) => !withPolicy.has(e.matricule));
  }, [employes, politiques]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#565556]">Politiques de voyage</h2>
          <p className="text-sm text-[#A5A6A5] mt-1">Gérez les classes aériennes et hôtels autorisés par employé</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#A11B1B] text-white text-sm font-medium hover:bg-[#8a1616] transition-colors">
            <UserPlus className="w-4 h-4" />Créer une politique
          </button>
          <button
            onClick={load}
            disabled={loading}
            className="p-2 rounded-lg border border-[#e5e5e5] text-[#565556] hover:bg-[#f4f4f4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Actualiser"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A5A6A5]" />
        <input type="text" placeholder="Rechercher par nom ou matricule…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10 bg-white" />
      </div>

      {error && <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}

      {/* Table */}
      <div className="rounded-xl border border-[#e5e5e5] overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e5e5e5] bg-[#fafafa]">
                <th className="text-left px-4 py-3 font-medium text-[#565556]">Employé</th>
                <th className="text-left px-4 py-3 font-medium text-[#565556]">Matricule</th>
                <th className="text-left px-4 py-3 font-medium text-[#565556]">Classes aériennes</th>
                <th className="text-left px-4 py-3 font-medium text-[#565556]">Hôtel max</th>
                <th className="text-right px-4 py-3 font-medium text-[#565556]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-[#A5A6A5]"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-[#A5A6A5]">Aucune politique trouvée</td></tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="border-b border-[#f0f0f0] hover:bg-[#fafafa] transition-colors">
                    <td className="px-4 py-3 text-[#565556] font-medium">{p.user?.prenom ?? '—'} {p.user?.nom ?? ''}</td>
                    <td className="px-4 py-3 text-[#565556] font-mono text-xs">{p.matricule}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {classBadge('Y', p.y)}
                        {classBadge('W', p.w)}
                        {classBadge('J', p.j)}
                        {classBadge('F', p.f)}
                      </div>
                    </td>
                    <td className="px-4 py-3">{hotelStars(p.hotel)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(p)} className="p-1.5 rounded-md hover:bg-[#f4f4f4] text-[#565556]" title="Modifier"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => openDelete(p)} className="p-1.5 rounded-md hover:bg-red-50 text-red-600" title="Supprimer"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Create */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-[#e5e5e5] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#565556]">Créer une politique de voyage</h3>
              <button onClick={() => setShowCreate(false)} className="p-1 rounded-md hover:bg-[#f4f4f4] text-[#A5A6A5]"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#565556] mb-1">Employé</label>
                <select
                  value={createPayload.matricule}
                  onChange={(e) => setCreatePayload((prev) => ({ ...prev, matricule: e.target.value }))}
                  className={inputCls + ' w-full'}
                  disabled={empLoading}
                >
                  <option value="">{empLoading ? 'Chargement…' : 'Sélectionnez un employé'}</option>
                  {availableEmployes.map((e) => (
                    <option key={e.matricule} value={e.matricule}>{e.prenom} {e.nom} — {e.matricule}</option>
                  ))}
                </select>
                {availableEmployes.length === 0 && !empLoading && <p className="text-xs text-amber-600 mt-1">Tous les employés ont déjà une politique.</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#565556]">Classes aériennes autorisées</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'y' as const, label: 'Économique (Y)' },
                    { key: 'w' as const, label: 'Éco Premium (W)' },
                    { key: 'j' as const, label: 'Affaires (J)' },
                    { key: 'f' as const, label: 'Première (F)' },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center gap-2 p-3 rounded-lg border border-[#e5e5e5] cursor-pointer hover:bg-[#fafafa]">
                      <input
                        type="checkbox"
                        checked={!!createPayload[item.key]}
                        onChange={(e) => setCreatePayload((prev) => ({ ...prev, [item.key]: e.target.checked }))}
                        className="w-4 h-4 accent-[#A11B1B]"
                      />
                      <span className="text-sm text-[#565556]">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#565556] mb-1">Étoiles hôtel max</label>
                <input
                  type="number" min={0} max={5}
                  value={createPayload.hotel}
                  onChange={(e) => setCreatePayload((prev) => ({ ...prev, hotel: Number(e.target.value) }))}
                  className={inputCls + ' w-full'}
                />
              </div>

              {createError && <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{createError}</div>}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-[#565556] hover:bg-[#f4f4f4]">Annuler</button>
                <button type="submit" disabled={createLoading || !createPayload.matricule} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#A11B1B] text-white text-sm font-medium hover:bg-[#8a1616] disabled:opacity-60">
                  {createLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit */}
      {showEdit && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-[#e5e5e5] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#565556]">Modifier la politique</h3>
              <button onClick={() => setShowEdit(false)} className="p-1 rounded-md hover:bg-[#f4f4f4] text-[#A5A6A5]"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#fafafa] border border-[#e5e5e5]">
              <div className="w-8 h-8 rounded-full bg-[#A11B1B]/10 flex items-center justify-center text-[#A11B1B] text-xs font-bold">{selected.user?.prenom?.[0]}{selected.user?.nom?.[0]}</div>
              <div>
                <p className="text-sm font-medium text-[#565556]">{selected.user?.prenom} {selected.user?.nom}</p>
                <p className="text-xs text-[#A5A6A5] font-mono">{selected.matricule}</p>
              </div>
            </div>
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#565556]">Classes aériennes autorisées</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'y' as const, label: 'Économique (Y)' },
                    { key: 'w' as const, label: 'Éco Premium (W)' },
                    { key: 'j' as const, label: 'Affaires (J)' },
                    { key: 'f' as const, label: 'Première (F)' },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center gap-2 p-3 rounded-lg border border-[#e5e5e5] cursor-pointer hover:bg-[#fafafa]">
                      <input
                        type="checkbox"
                        checked={!!editPayload[item.key]}
                        onChange={(e) => setEditPayload((prev) => ({ ...prev, [item.key]: e.target.checked }))}
                        className="w-4 h-4 accent-[#A11B1B]"
                      />
                      <span className="text-sm text-[#565556]">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#565556] mb-1">Étoiles hôtel max</label>
                <input
                  type="number" min={0} max={5}
                  value={editPayload.hotel}
                  onChange={(e) => setEditPayload((prev) => ({ ...prev, hotel: Number(e.target.value) }))}
                  className={inputCls + ' w-full'}
                />
              </div>

              {editError && <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{editError}</div>}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowEdit(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-[#565556] hover:bg-[#f4f4f4]">Annuler</button>
                <button type="submit" disabled={editLoading} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#A11B1B] text-white text-sm font-medium hover:bg-[#8a1616] disabled:opacity-60">
                  {editLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pencil className="w-4 h-4" />}
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Delete */}
      {showDelete && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-[#e5e5e5] p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#565556]">Supprimer la politique</h3>
                <p className="text-sm text-[#A5A6A5]">Cette action est irréversible.</p>
              </div>
            </div>
            <p className="text-sm text-[#565556]">
              <span>Supprimer la politique de </span>
              <strong>{selected.user?.prenom} {selected.user?.nom}</strong>
              <span> ({selected.matricule}) ?</span>
            </p>
            {deleteError && <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{deleteError}</div>}
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowDelete(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-[#565556] hover:bg-[#f4f4f4]">Annuler</button>
              <button onClick={handleDelete} disabled={deleteLoading} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-60">
                {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
