import { useEffect, useState } from 'react';
import {
  FileText, Loader2, Eye,
  Lock, Calendar, ArrowRight, MapPin, Plane, RefreshCw,
} from 'lucide-react';
import {
  getAllDemandesVoyage, approuverDemandeVoyage, rejeterDemandeVoyage, cloturerDemandeVoyage,
  type DemandeVoyage,
} from '../../services/demandesVoyage';
import { getErrorMessage } from '../../lib/api-errors';
import { ErrorAlert } from '../../components/ErrorAlert';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../../components/Modal';

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}
function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function statutBadge(statut: string) {
  const map: Record<string, { cls: string; text: string }> = {
    EN_ATTENTE: { cls: 'bg-amber-50 text-amber-700 border-amber-200', text: 'En attente' },
    APPROUVEE: { cls: 'bg-green-50 text-green-700 border-green-200', text: 'Approuvée' },
    REJETEE: { cls: 'bg-red-50 text-red-700 border-red-200', text: 'Rejetée' },
    ANNULEE: { cls: 'bg-gray-100 text-gray-600 border-gray-200', text: 'Annulée' },
    TERMINEE: { cls: 'bg-blue-50 text-blue-700 border-blue-200', text: 'Terminée' },
  };
  const s = map[statut] || { cls: 'bg-gray-100 text-gray-600 border-gray-200', text: statut };
  return <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${s.cls}`}><span>{s.text}</span></span>;
}

function classBadge(classe: string) {
  const labels: Record<string, string> = { Y: 'Économique', W: 'Premium', J: 'Affaires', F: 'Première' };
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#f4f4f4] text-xs text-[#565556] font-medium"><Plane className="w-3 h-3 text-[#A11B1B]" />{labels[classe] || classe}</span>;
}

export default function Demandes() {
  const [demandes, setDemandes] = useState<DemandeVoyage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const [sel, setSel] = useState<DemandeVoyage | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [actionLoad, setActionLoad] = useState(false);
  const [commentaire, setCommentaire] = useState('');

  async function load() {
    setLoading(true); setError('');
    try {
      const res = await getAllDemandesVoyage();
      setDemandes(res.demandes);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleAction(id: number, action: 'approuver' | 'rejeter' | 'cloturer') {
    setActionLoad(true);
    try {
      if (action === 'approuver') await approuverDemandeVoyage(id, commentaire || undefined);
      else if (action === 'rejeter') await rejeterDemandeVoyage(id, commentaire || undefined);
      else await cloturerDemandeVoyage(id);
      setCommentaire(''); setShowDetail(false); setSel(null); await load();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally { setActionLoad(false); }
  }

  const filtered = demandes.filter((d) => {
    const m = `${d.depart} ${d.arrive} ${d.motif} ${d.user?.prenom} ${d.user?.nom} ${d.entreprise?.nom}`.toLowerCase();
    return m.includes(filter.toLowerCase()) && (!statusFilter || d.statut === statusFilter);
  });

  const counts = {
    total: demandes.length,
    enAttente: demandes.filter((d) => d.statut === 'EN_ATTENTE').length,
    approuvee: demandes.filter((d) => d.statut === 'APPROUVEE').length,
    rejetee: demandes.filter((d) => d.statut === 'REJETEE').length,
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#A11B1B]/10 flex items-center justify-center"><FileText className="w-5 h-5 text-[#A11B1B]" /></div>
          <div>
            <h1 className="text-xl font-bold text-[#565556]"><span>Demandes de voyage</span></h1>
            <p className="text-sm text-[#A5A6A5]"><span>Gérez et approuvez les demandes</span></p>
          </div>
        </div>
        <button onClick={load} disabled={loading} className="p-2 rounded-lg border border-[#e5e5e5] text-[#565556] hover:bg-[#f4f4f4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors" title="Actualiser"><RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} /></button>
      </div>

      {error && <ErrorAlert error={error} onDismiss={() => setError('')} />}

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: counts.total, color: 'text-[#565556]' },
          { label: 'En attente', value: counts.enAttente, color: 'text-amber-600' },
          { label: 'Approuvées', value: counts.approuvee, color: 'text-green-600' },
          { label: 'Rejetées', value: counts.rejetee, color: 'text-red-600' },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-xl bg-white border border-[#e5e5e5]">
            <p className="text-xs text-[#A5A6A5] uppercase tracking-wide"><span>{s.label}</span></p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Rechercher..."
          className="flex-1 px-4 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10 bg-white" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] bg-white">
          <option value="">Tous les statuts</option>
          <option value="EN_ATTENTE">En attente</option>
          <option value="APPROUVEE">Approuvées</option>
          <option value="REJETEE">Rejetées</option>
          <option value="ANNULEE">Annulées</option>
          <option value="TERMINEE">Terminées</option>
        </select>
      </div>

      <div className="rounded-xl border border-[#e5e5e5] bg-white overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-[#A5A6A5]"><Loader2 className="w-5 h-5 animate-spin" /><span>Chargement…</span></div>
        ) : filtered.length === 0 ? (
          <div className="px-4 py-12 text-center text-[#A5A6A5]"><Plane className="w-10 h-10 mx-auto mb-3 text-[#e5e5e5]" /><p className="text-sm"><span>Aucune demande trouvée</span></p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5e5e5] bg-[#fafafa]">
                  {['Employé', 'Entreprise', 'Trajet', 'Ville', 'Date', 'Classe', 'Hôtel', 'Statut', 'Actions'].map((h) => (
                    <th key={h} className={`px-4 py-2.5 font-medium text-[#565556] ${h === 'Actions' ? 'text-right' : 'text-left'}`}><span>{h}</span></th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => (
                  <tr key={d.id} className="border-b border-[#f0f0f0]">
                    <td className="px-4 py-2.5 text-[#565556]">{d.user?.prenom} {d.user?.nom}<div className="text-xs text-[#A5A6A5]">{d.user?.matricule}</div></td>
                    <td className="px-4 py-2.5 text-[#565556]">{d.entreprise?.nom}<div className="text-xs text-[#A5A6A5] font-mono">{d.entreprise?.identifiant}</div></td>
                    <td className="px-4 py-2.5"><div className="flex items-center gap-2 text-[#565556]"><MapPin className="w-3.5 h-3.5 text-[#A11B1B]" /><span>{d.depart}</span><ArrowRight className="w-3.5 h-3.5 text-[#A5A6A5]" /><span>{d.arrive}</span>{d.allerRetour && <span className="ml-1 px-1.5 py-0.5 rounded bg-[#f4f4f4] text-[10px] text-[#A5A6A5]"><span>A/R</span></span>}</div></td>
                    <td className="px-4 py-2.5 text-[#565556]">{d.ville || <span className="text-xs text-[#A5A6A5]">—</span>}</td>
                    <td className="px-4 py-2.5 text-[#565556]"><div className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-[#A5A6A5]" /><span>{fmtDate(d.dateDepart)}</span></div></td>
                    <td className="px-4 py-2.5">{classBadge(d.classe)}</td>
                    <td className="px-4 py-2.5 text-[#565556]">
                      {d.hotel && d.hotel !== 'NON_INCLUS' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#f4f4f4] text-xs text-[#565556] font-medium">
                          {d.hotel} {d.hotel === '1' ? 'étoile' : 'étoiles'}
                        </span>
                      ) : <span className="text-xs text-[#A5A6A5]">Non inclus</span>}
                    </td>
                    <td className="px-4 py-2.5">{statutBadge(d.statut)}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setSel(d); setShowDetail(true); }} className="p-1.5 rounded-md hover:bg-[#f4f4f4] text-[#565556]" title="Détail"><Eye className="w-4 h-4" /></button>
                        {d.statut === 'APPROUVEE' && (
                          <button onClick={() => handleAction(d.id, 'cloturer')} disabled={actionLoad} className="p-1.5 rounded-md hover:bg-blue-50 text-blue-600" title="Clôturer"><Lock className="w-4 h-4" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail + actions modal */}
      {showDetail && sel && (
        <Modal
          isOpen={showDetail}
          onClose={() => { setShowDetail(false); setSel(null); setCommentaire(''); }}
          size="md"
        >
          <ModalHeader
            title="Détail de la demande"
            subtitle={`Référence #${sel.id}`}
            icon={<FileText className="w-5 h-5 text-white" />}
            variant="brand"
          />
          <ModalBody className="p-6 space-y-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-[#A11B1B]/5 to-[#8a1616]/5 border border-[#A11B1B]/10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[#A5A6A5]">Employé</p>
                  <p className="text-sm font-semibold text-[#565556]">{sel.user?.prenom} {sel.user?.nom}</p>
                  <p className="text-xs text-[#A5A6A5]">{sel.user?.matricule}</p>
                </div>
                <div>
                  <p className="text-xs text-[#A5A6A5]">Entreprise</p>
                  <p className="text-sm font-semibold text-[#565556]">{sel.entreprise?.nom}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-[#A5A6A5]">Trajet</span><span className="text-[#565556]">{sel.depart} → {sel.arrive} {sel.allerRetour ? '(A/R)' : ''}</span></div>
              {sel.ville && <div className="flex justify-between"><span className="text-[#A5A6A5]">Ville</span><span className="text-[#565556]">{sel.ville}</span></div>}
              {sel.pays && <div className="flex justify-between"><span className="text-[#A5A6A5]">Pays</span><span className="text-[#565556]">{sel.pays}</span></div>}
              {sel.etat && <div className="flex justify-between"><span className="text-[#A5A6A5]">État/Province</span><span className="text-[#565556]">{sel.etat}</span></div>}
              {sel.region && <div className="flex justify-between"><span className="text-[#A5A6A5]">Région</span><span className="text-[#565556]">{sel.region}</span></div>}
              <div className="flex justify-between"><span className="text-[#A5A6A5]">Départ</span><span className="text-[#565556]">{fmtDateTime(sel.dateDepart)}</span></div>
              {sel.dateRetour && <div className="flex justify-between"><span className="text-[#A5A6A5]">Retour</span><span className="text-[#565556]">{fmtDateTime(sel.dateRetour)}</span></div>}
              <div className="flex justify-between"><span className="text-[#A5A6A5]">Classe</span>{classBadge(sel.classe)}</div>
              <div className="flex justify-between"><span className="text-[#A5A6A5]">Hôtel</span>
                {sel.hotel && sel.hotel !== 'NON_INCLUS' ? (
                  <span className="text-[#565556]">{sel.hotel} {sel.hotel === '1' ? 'étoile' : 'étoiles'}</span>
                ) : <span className="text-[#A5A6A5]">Non inclus</span>}
              </div>
              <div className="flex justify-between"><span className="text-[#A5A6A5]">Statut</span>{statutBadge(sel.statut)}</div>
              <div className="flex justify-between"><span className="text-[#A5A6A5]">Motif</span><span className="text-[#565556]">{sel.motif}</span></div>
            </div>

            {sel.commentaire && (
              <div className="p-3 rounded-lg bg-[#fafafa] border border-[#e5e5e5] text-sm">
                <p className="text-xs text-[#A5A6A5] mb-1">Commentaire</p>
                <p className="text-[#565556]">{sel.commentaire}</p>
              </div>
            )}

            {sel.statut === 'EN_ATTENTE' && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#565556]">Commentaire (obligatoire pour le rejet)</label>
                <textarea value={commentaire} onChange={(e) => setCommentaire(e.target.value)} rows={2}
                  placeholder="Ex: Budget approuvé / Demande non conforme…"
                  className="w-full px-3 py-2 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10 bg-white resize-none" />
              </div>
            )}
          </ModalBody>
          {(sel.statut === 'EN_ATTENTE' || sel.statut === 'APPROUVEE') && (
            <ModalFooter className="gap-2">
              {sel.statut === 'EN_ATTENTE' && (
                <>
                  <button onClick={() => handleAction(sel.id, 'approuver')} disabled={actionLoad}
                    className="flex-1 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-60">Approuver</button>
                  <button onClick={() => handleAction(sel.id, 'rejeter')} disabled={actionLoad}
                    className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-60">Rejeter</button>
                </>
              )}
              {sel.statut === 'APPROUVEE' && (
                <button onClick={() => handleAction(sel.id, 'cloturer')} disabled={actionLoad}
                  className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60">Marquer comme terminée</button>
              )}
            </ModalFooter>
          )}
        </Modal>
      )}
    </div>
  );
}
