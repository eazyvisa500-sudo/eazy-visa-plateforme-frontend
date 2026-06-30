import { useEffect, useMemo, useState } from 'react';
import {
  Building2, Search, Plus, X, Eye, Pencil, Lock, Unlock,
  Users, CheckCircle2, AlertCircle, Loader2
} from 'lucide-react';
import EntrepriseDetailModal from '../../components/EntrepriseDetailModal';
import {
  getEntreprises,
  getEntreprise,
  createEntreprise,
  updateEntreprise,
  toggleEntrepriseStatus,
  uploadLogo,
  type Entreprise,
  type EntrepriseDetail,
} from '../../services/entreprises';

export default function Entreprises() {
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const [detail, setDetail] = useState<EntrepriseDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [createNom, setCreateNom] = useState('');
  const [createAdresse, setCreateAdresse] = useState('');
  const [createPays, setCreatePays] = useState('');
  const [createRegion, setCreateRegion] = useState('');
  const [createVille, setCreateVille] = useState('');
  const [createLogo, setCreateLogo] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  const [editId, setEditId] = useState<number | null>(null);
  const [editNom, setEditNom] = useState('');
  const [editAdresse, setEditAdresse] = useState('');
  const [editPays, setEditPays] = useState('');
  const [editRegion, setEditRegion] = useState('');
  const [editVille, setEditVille] = useState('');
  const [editLogoFile, setEditLogoFile] = useState<File | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  const [actionId, setActionId] = useState<number | null>(null);

  useEffect(() => {
    loadEntreprises();
  }, []);

  async function loadEntreprises() {
    setLoading(true);
    setError('');
    try {
      const data = await getEntreprises();
      setEntreprises(data);
    } catch (err: unknown) {
      const msg = (err as Error & { data?: { message?: string } }).data?.message || 'Erreur de chargement';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function openDetail(id: number) {
    setDetailLoading(true);
    setShowDetail(true);
    try {
      const data = await getEntreprise(id);
      setDetail(data);
    } catch {
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError('');
    setCreateLoading(true);
    try {
      await createEntreprise({
        nom: createNom,
        adresse: createAdresse,
        pays: createPays,
        region: createRegion,
        ville: createVille,
        ...(createLogo.trim() ? { logo: createLogo.trim() } : {}),
      });
      setShowCreate(false);
      setCreateNom('');
      setCreateAdresse('');
      setCreatePays('');
      setCreateRegion('');
      setCreateVille('');
      setCreateLogo('');
      await loadEntreprises();
    } catch (err: unknown) {
      const msg = (err as Error & { data?: { message?: string } }).data?.message || 'Erreur lors de la création';
      setCreateError(msg);
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (editId == null) return;
    setEditError('');
    setEditLoading(true);
    try {
      const payload: { nom?: string; adresse?: string; pays?: string; region?: string; ville?: string } = {};
      if (editNom.trim()) payload.nom = editNom.trim();
      if (editAdresse.trim()) payload.adresse = editAdresse.trim();
      if (editPays.trim()) payload.pays = editPays.trim();
      if (editRegion.trim()) payload.region = editRegion.trim();
      if (editVille.trim()) payload.ville = editVille.trim();
      await updateEntreprise(editId, payload);
      if (editLogoFile) {
        await uploadLogo(editId, editLogoFile);
      }
      setEditId(null);
      setEditLogoFile(null);
      await loadEntreprises();
    } catch (err: unknown) {
      const msg = (err as Error & { data?: { message?: string } }).data?.message || 'Erreur lors de la modification';
      setEditError(msg);
    } finally {
      setEditLoading(false);
    }
  }

  async function handleToggleStatus(id: number) {
    setActionId(id);
    try {
      await toggleEntrepriseStatus(id);
      await loadEntreprises();
    } catch {
      // silently handled by reload failure
    } finally {
      setActionId(null);
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return entreprises;
    return entreprises.filter(
      (e) =>
        e.nom.toLowerCase().includes(q) ||
        e.identifiant.toLowerCase().includes(q) ||
        e.adresse.toLowerCase().includes(q) ||
        e.pays.toLowerCase().includes(q) ||
        e.region.toLowerCase().includes(q) ||
        e.ville.toLowerCase().includes(q)
    );
  }, [entreprises, search]);

  function openEdit(ent: Entreprise) {
    setEditId(ent.id);
    setEditNom(ent.nom);
    setEditAdresse(ent.adresse);
    setEditPays(ent.pays);
    setEditRegion(ent.region);
    setEditVille(ent.ville);
    setEditLogoFile(null);
    setEditError('');
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-[#565556] flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#A11B1B]" />
            Entreprises
          </h2>
          <p className="text-sm text-[#A5A6A5] mt-0.5">
            {entreprises.length} entreprise{entreprises.length > 1 ? 's' : ''} enregistrée
            {entreprises.length > 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => {
            setShowCreate(true);
            setCreateError('');
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#A11B1B] text-white text-sm font-medium hover:bg-[#8a1616] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Créer une entreprise
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A5A6A5]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom, identifiant, adresse, pays, région ou ville..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] bg-white placeholder:text-[#A5A6A5] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10 transition-all"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#e5e5e5] shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-[#A5A6A5]">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Chargement...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[#A5A6A5]">
            <Building2 className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm">Aucune entreprise trouvée</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5e5e5] bg-[#fafafa]">
                  <th className="text-left px-5 py-3 font-medium text-[#565556]">Nom</th>
                  <th className="text-left px-5 py-3 font-medium text-[#565556]">Identifiant</th>
                  <th className="text-left px-5 py-3 font-medium text-[#565556]">Adresse</th>
                  <th className="text-left px-5 py-3 font-medium text-[#565556]">Employés</th>
                  <th className="text-left px-5 py-3 font-medium text-[#565556]">Statut</th>
                  <th className="text-right px-5 py-3 font-medium text-[#565556]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ent) => (
                  <tr key={ent.id} className="border-b border-[#f0f0f0] hover:bg-[#fafafa] transition-colors">
                    <td className="px-5 py-3 font-medium text-[#565556]">{ent.nom}</td>
                    <td className="px-5 py-3">
                      <span className="inline-block px-2 py-0.5 rounded bg-[#f4f4f4] text-xs font-mono text-[#565556]">
                        {ent.identifiant}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[#A5A6A5] max-w-xs truncate">{ent.adresse}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 text-[#565556]">
                        <Users className="w-3.5 h-3.5 text-[#A5A6A5]" />
                        {ent._count?.users ?? 0}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {ent.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                          <Lock className="w-3 h-3" />
                          Bloquée
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openDetail(ent.id)}
                          className="p-2 rounded-md text-[#A5A6A5] hover:text-[#A11B1B] hover:bg-[#A11B1B]/10 transition-colors"
                          title="Voir détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEdit(ent)}
                          className="p-2 rounded-md text-[#A5A6A5] hover:text-[#A11B1B] hover:bg-[#A11B1B]/10 transition-colors"
                          title="Modifier"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(ent.id)}
                          disabled={actionId === ent.id}
                          className="p-2 rounded-md text-[#A5A6A5] hover:text-[#A11B1B] hover:bg-[#A11B1B]/10 transition-colors disabled:opacity-50"
                          title={ent.is_active ? 'Bloquer' : 'Activer'}
                        >
                          {ent.is_active ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#565556]">Créer une entreprise</h3>
              <button onClick={() => setShowCreate(false)} className="p-1 rounded-md hover:bg-[#f4f4f4] text-[#A5A6A5]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              {createError && (
                <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                  {createError}
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#565556]">Nom</label>
                <input
                  value={createNom}
                  onChange={(e) => setCreateNom(e.target.value)}
                  placeholder="Acme Corp"
                  required
                  className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#565556]">Adresse</label>
                <input
                  value={createAdresse}
                  onChange={(e) => setCreateAdresse(e.target.value)}
                  placeholder="123 Rue Principale"
                  required
                  className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#565556]">Pays *</label>
                  <input
                    value={createPays}
                    onChange={(e) => setCreatePays(e.target.value)}
                    placeholder="Sénégal"
                    required
                    className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#565556]">Région *</label>
                  <input
                    value={createRegion}
                    onChange={(e) => setCreateRegion(e.target.value)}
                    placeholder="Dakar"
                    required
                    className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#565556]">Ville *</label>
                  <input
                    value={createVille}
                    onChange={(e) => setCreateVille(e.target.value)}
                    placeholder="Dakar"
                    required
                    className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#565556]">Logo (URL)</label>
                <input
                  value={createLogo}
                  onChange={(e) => setCreateLogo(e.target.value)}
                  placeholder="https://cdn.example.workers.dev/logos/acme.png"
                  className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10"
                />
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-[#565556] hover:bg-[#f4f4f4] transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-4 py-2 rounded-lg bg-[#A11B1B] text-white text-sm font-medium hover:bg-[#8a1616] transition-colors disabled:opacity-60"
                >
                  {createLoading ? 'Création…' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#565556]">Modifier l'entreprise</h3>
              <button onClick={() => setEditId(null)} className="p-1 rounded-md hover:bg-[#f4f4f4] text-[#A5A6A5]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEdit} className="flex flex-col gap-4">
              {editError && (
                <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                  {editError}
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#565556]">Nom</label>
                <input
                  value={editNom}
                  onChange={(e) => setEditNom(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#565556]">Adresse</label>
                <input
                  value={editAdresse}
                  onChange={(e) => setEditAdresse(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#565556]">Pays</label>
                  <input
                    value={editPays}
                    onChange={(e) => setEditPays(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#565556]">Région</label>
                  <input
                    value={editRegion}
                    onChange={(e) => setEditRegion(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#565556]">Ville</label>
                  <input
                    value={editVille}
                    onChange={(e) => setEditVille(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#565556]">Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditLogoFile(e.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-[#565556] file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#f4f4f4] file:text-[#565556] hover:file:bg-[#e5e5e5]"
                />
                {editLogoFile && (
                  <img
                    src={URL.createObjectURL(editLogoFile)}
                    alt="Preview"
                    className="h-16 w-auto rounded object-contain mt-2"
                  />
                )}
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setEditId(null)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-[#565556] hover:bg-[#f4f4f4] transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-4 py-2 rounded-lg bg-[#A11B1B] text-white text-sm font-medium hover:bg-[#8a1616] transition-colors disabled:opacity-60"
                >
                  {editLoading ? 'Enregistrement…' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && (
        <EntrepriseDetailModal
          detail={detail}
          loading={detailLoading}
          onClose={() => { setShowDetail(false); setDetail(null); }}
          onRefresh={async () => {
            if (detail) {
              setDetailLoading(true);
              try {
                const data = await getEntreprise(detail.id);
                setDetail(data);
              } catch {
                // keep existing detail on error
              } finally {
                setDetailLoading(false);
              }
            }
          }}
        />
      )}
    </div>
  );
}

