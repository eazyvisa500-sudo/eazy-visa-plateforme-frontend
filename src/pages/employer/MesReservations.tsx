import { useEffect, useState } from 'react';
import {
  Plane, Hotel, Loader2, AlertTriangle, Eye, Calendar, MapPin, ArrowRight,
  CheckCircle2, Ban,
} from 'lucide-react';
import {
  getMesReservations,
  type ReservationBillet,
  type ReservationHotel,
} from '../../services/reservations';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../../components/Modal';

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function statutBadge(statut: string) {
  const map: Record<string, { cls: string; text: string; icon: React.ReactNode }> = {
    EN_ATTENTE: { cls: 'bg-amber-50 text-amber-700 border-amber-200', text: 'En attente', icon: null },
    CONFIRMEE: { cls: 'bg-green-50 text-green-700 border-green-200', text: 'Confirmée', icon: <CheckCircle2 className="w-3 h-3" /> },
    EMISE: { cls: 'bg-blue-50 text-blue-700 border-blue-200', text: 'Émise', icon: <CheckCircle2 className="w-3 h-3" /> },
    ANNULEE: { cls: 'bg-gray-100 text-gray-600 border-gray-200', text: 'Annulée', icon: <Ban className="w-3 h-3" /> },
  };
  const s = map[statut] || { cls: 'bg-gray-100 text-gray-600 border-gray-200', text: statut, icon: null };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${s.cls}`}>
      {s.icon}<span>{s.text}</span>
    </span>
  );
}

function classBadge(classe: string) {
  const labels: Record<string, string> = { Y: 'Économique', W: 'Premium', J: 'Affaires', F: 'Première' };
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#f4f4f4] text-xs text-[#565556] font-medium">
      <Plane className="w-3 h-3 text-[#A11B1B]" />{labels[classe] || classe}
    </span>
  );
}

export default function MesReservations() {
  const [billets, setBillets] = useState<ReservationBillet[]>([]);
  const [hotels, setHotels] = useState<ReservationHotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showBilletDetail, setShowBilletDetail] = useState(false);
  const [showHotelDetail, setShowHotelDetail] = useState(false);
  const [selBillet, setSelBillet] = useState<ReservationBillet | null>(null);
  const [selHotel, setSelHotel] = useState<ReservationHotel | null>(null);

  async function load() {
    setLoading(true); setError('');
    try {
      const res = await getMesReservations();
      setBillets(res.billets.data);
      setHotels(res.hotels.data);
    } catch (err: unknown) {
      const msg = (err as Error & { data?: { message?: string } }).data?.message || 'Erreur de chargement';
      setError(msg);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#A11B1B]/10 flex items-center justify-center">
          <Plane className="w-5 h-5 text-[#A11B1B]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#565556]">Mes réservations</h1>
          <p className="text-sm text-[#A5A6A5]">Billets et hôtels réservés</p>
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
      ) : (
        <>
          {/* Billets */}
          <div className="rounded-xl border border-[#e5e5e5] bg-white overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#e5e5e5] bg-[#fafafa]">
              <Plane className="w-4 h-4 text-[#A11B1B]" />
              <h2 className="text-sm font-semibold text-[#565556]">Billets ({billets.length})</h2>
            </div>
            {billets.length === 0 ? (
              <div className="px-4 py-8 text-center text-[#A5A6A5]">
                <Plane className="w-10 h-10 mx-auto mb-3 text-[#e5e5e5]" />
                <p className="text-sm">Aucun billet réservé</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#e5e5e5] bg-[#fafafa]">
                      {['Réf', 'Trajet', 'Dates', 'Classe', 'Statut', 'Actions'].map((h) => (
                        <th key={h} className={`px-4 py-2.5 font-medium text-[#565556] ${h === 'Actions' ? 'text-right' : 'text-left'}`}>
                          <span>{h}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {billets.map((b) => (
                      <tr key={b.id} className="border-b border-[#f0f0f0]">
                        <td className="px-4 py-2.5 font-mono text-[#565556]">{b.numeroReservation}</td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2 text-[#565556]">
                            <MapPin className="w-3.5 h-3.5 text-[#A11B1B]" />
                            <span>{b.aeroportDepart}</span><ArrowRight className="w-3.5 h-3.5 text-[#A5A6A5]" /><span>{b.aeroportArrivee}</span>
                            {b.allerRetour && <span className="ml-1 px-1.5 py-0.5 rounded bg-[#f4f4f4] text-[10px] text-[#A5A6A5]">A/R</span>}
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-[#565556]">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-[#A5A6A5]" /><span>{fmtDate(b.dateVolDepart)}</span></div>
                            {b.allerRetour && b.dateVolRetourDepart && (
                              <div className="flex items-center gap-1 text-xs text-[#A5A6A5]"><span>Retour: {fmtDate(b.dateVolRetourDepart)}</span></div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2.5">{classBadge(b.classe)}</td>
                        <td className="px-4 py-2.5">{statutBadge(b.statut)}</td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => { setSelBillet(b); setShowBilletDetail(true); }} className="p-1.5 rounded-md hover:bg-[#f4f4f4] text-[#565556]" title="Détail"><Eye className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Hôtels */}
          <div className="rounded-xl border border-[#e5e5e5] bg-white overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#e5e5e5] bg-[#fafafa]">
              <Hotel className="w-4 h-4 text-[#A11B1B]" />
              <h2 className="text-sm font-semibold text-[#565556]">Hôtels ({hotels.length})</h2>
            </div>
            {hotels.length === 0 ? (
              <div className="px-4 py-8 text-center text-[#A5A6A5]">
                <Hotel className="w-10 h-10 mx-auto mb-3 text-[#e5e5e5]" />
                <p className="text-sm">Aucun hôtel réservé</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#e5e5e5] bg-[#fafafa]">
                      {['Réf', 'Hôtel', 'Ville', 'Catégorie', 'Statut', 'Actions'].map((h) => (
                        <th key={h} className={`px-4 py-2.5 font-medium text-[#565556] ${h === 'Actions' ? 'text-right' : 'text-left'}`}>
                          <span>{h}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {hotels.map((h) => (
                      <tr key={h.id} className="border-b border-[#f0f0f0]">
                        <td className="px-4 py-2.5 font-mono text-[#565556]">{h.numeroConfirmation || '—'}</td>
                        <td className="px-4 py-2.5 text-[#565556]">{h.nomHotel || 'Non défini'}</td>
                        <td className="px-4 py-2.5 text-[#565556]">{h.ville}</td>
                        <td className="px-4 py-2.5 text-[#565556]">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#f4f4f4] text-xs text-[#565556] font-medium">
                            {h.categorie} {h.categorie === '1' ? 'étoile' : 'étoiles'}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">{statutBadge(h.statut)}</td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => { setSelHotel(h); setShowHotelDetail(true); }} className="p-1.5 rounded-md hover:bg-[#f4f4f4] text-[#565556]" title="Détail"><Eye className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal détail billet */}
      {showBilletDetail && selBillet && (
        <Modal
          isOpen={showBilletDetail}
          onClose={() => {
            setShowBilletDetail(false);
            setSelBillet(null);
          }}
          size="xl"
        >
          <ModalHeader
            title="Détail du billet"
            subtitle={selBillet.numeroReservation}
            icon={<Plane className="w-5 h-5 text-white" />}
            variant="brand"
          />
          <ModalBody className="p-8 space-y-6">
            {/* Section Trajet */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-[#A11B1B]/5 to-[#8a1616]/5 border border-[#A11B1B]/10">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-[#565556] flex items-center gap-2"><MapPin className="w-4 h-4 text-[#A11B1B]" />Trajet</h4>
                {selBillet.allerRetour && <span className="px-2 py-1 rounded-full bg-[#A11B1B]/10 text-[#A11B1B] text-xs font-medium">Aller-retour</span>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[#A5A6A5] mb-1">Départ</p>
                  <p className="text-lg font-bold text-[#565556]">{selBillet.aeroportDepart}</p>
                  <p className="text-sm text-[#565556]">{fmtDateTime(selBillet.dateVolDepart)}</p>
                </div>
                <div>
                  <p className="text-xs text-[#A5A6A5] mb-1">Arrivée</p>
                  <p className="text-lg font-bold text-[#565556]">{selBillet.aeroportArrivee}</p>
                  {selBillet.dateVolArrivee && <p className="text-sm text-[#565556]">{fmtDateTime(selBillet.dateVolArrivee)}</p>}
                </div>
              </div>
              {selBillet.allerRetour && selBillet.dateVolRetourDepart && (
                <div className="mt-4 pt-4 border-t border-[#e5e5e5]">
                  <p className="text-xs text-[#A5A6A5] mb-2">Retour</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-[#565556]">{fmtDateTime(selBillet.dateVolRetourDepart)}</p>
                    </div>
                    {selBillet.dateVolRetourArrivee && (
                      <div>
                        <p className="text-sm font-medium text-[#565556]">{fmtDateTime(selBillet.dateVolRetourArrivee)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Section Détails vol */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                <p className="text-xs text-[#A5A6A5] mb-2">Informations vol</p>
                <div className="space-y-2">
                  {selBillet.compagnieAerienne && <div className="flex justify-between text-sm"><span className="text-[#A5A6A5]">Compagnie</span><span className="text-[#565556]">{selBillet.compagnieAerienne}</span></div>}
                  {selBillet.numeroVolAller && <div className="flex justify-between text-sm"><span className="text-[#A5A6A5]">Vol aller</span><span className="font-mono text-[#565556]">{selBillet.numeroVolAller}</span></div>}
                  {selBillet.numeroVolRetour && <div className="flex justify-between text-sm"><span className="text-[#A5A6A5]">Vol retour</span><span className="font-mono text-[#565556]">{selBillet.numeroVolRetour}</span></div>}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                <p className="text-xs text-[#A5A6A5] mb-2">Prix & Classe</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-[#A5A6A5]">Classe</span>{classBadge(selBillet.classe)}</div>
                  {selBillet.prix && <div className="flex justify-between text-sm"><span className="text-[#A5A6A5]">Prix</span><span className="font-bold text-[#565556]">{selBillet.prix.toLocaleString()} {selBillet.devise}</span></div>}
                  {selBillet.dateEmission && <div className="flex justify-between text-sm"><span className="text-[#A5A6A5]">Date émission</span><span className="text-[#565556]">{fmtDate(selBillet.dateEmission)}</span></div>}
                </div>
              </div>
            </div>

            {/* Section Statut & Billet */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                <p className="text-xs text-[#A5A6A5] mb-2">Statut</p>
                <div className="flex items-center justify-between">
                  {statutBadge(selBillet.statut)}
                </div>
              </div>
              {selBillet.numeroBillet && (
                <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                  <p className="text-xs text-[#A5A6A5] mb-2">Numéro de billet</p>
                  <p className="font-mono text-lg font-bold text-[#565556]">{selBillet.numeroBillet}</p>
                </div>
              )}
            </div>

            {/* Section Commentaire */}
            {selBillet.commentaire && (
              <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                <p className="text-xs text-[#A5A6A5] mb-2">Commentaire</p>
                <p className="text-sm text-[#565556]">{selBillet.commentaire}</p>
              </div>
            )}
          </ModalBody>
          <ModalFooter className="justify-between">
            <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 text-xs text-[#A5A6A5]">
              <span>Créé le {fmtDate(selBillet.createdAt)}</span>
              <span>Mis à jour le {fmtDate(selBillet.updatedAt)}</span>
            </div>
            <button
              onClick={() => {
                setShowBilletDetail(false);
                setSelBillet(null);
              }}
              className="px-5 py-2.5 rounded-lg text-sm font-medium bg-[#A11B1B] text-white hover:bg-[#8a1616] transition-colors"
            >
              Fermer
            </button>
          </ModalFooter>
        </Modal>
      )}

      {/* Modal détail hôtel */}
      {showHotelDetail && selHotel && (
        <Modal
          isOpen={showHotelDetail}
          onClose={() => {
            setShowHotelDetail(false);
            setSelHotel(null);
          }}
          size="xl"
        >
          <ModalHeader
            title="Détail de l'hôtel"
            subtitle={selHotel.numeroConfirmation || 'En attente'}
            icon={<Hotel className="w-5 h-5 text-white" />}
            variant="brand"
          />
          <ModalBody className="p-8 space-y-6">
            {/* Section Hôtel */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-[#A11B1B]/5 to-[#8a1616]/5 border border-[#A11B1B]/10">
              <h4 className="text-sm font-semibold text-[#565556] flex items-center gap-2 mb-4"><Hotel className="w-4 h-4 text-[#A11B1B]" />Informations hôtel</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[#A5A6A5] mb-1">Nom</p>
                  <p className="text-lg font-bold text-[#565556]">{selHotel.nomHotel || 'Non défini'}</p>
                </div>
                <div>
                  <p className="text-xs text-[#A5A6A5] mb-1">Catégorie</p>
                  <p className="text-lg font-bold text-[#565556]">{selHotel.categorie} {selHotel.categorie === '1' ? 'étoile' : 'étoiles'}</p>
                </div>
                <div>
                  <p className="text-xs text-[#A5A6A5] mb-1">Ville</p>
                  <p className="text-sm text-[#565556]">{selHotel.ville}</p>
                </div>
                {selHotel.pays && (
                  <div>
                    <p className="text-xs text-[#A5A6A5] mb-1">Pays</p>
                    <p className="text-sm text-[#565556]">{selHotel.pays}</p>
                  </div>
                )}
              </div>
              {selHotel.adresse && (
                <div className="mt-4 pt-4 border-t border-[#e5e5e5]">
                  <p className="text-xs text-[#A5A6A5] mb-1">Adresse</p>
                  <p className="text-sm text-[#565556]">{selHotel.adresse}</p>
                </div>
              )}
            </div>

            {/* Section Séjour & Prix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                <p className="text-xs text-[#A5A6A5] mb-2">Dates de séjour</p>
                <div className="space-y-2">
                  {selHotel.dateArrivee && <div className="flex justify-between text-sm"><span className="text-[#A5A6A5]">Arrivée</span><span className="text-[#565556]">{fmtDate(selHotel.dateArrivee)}</span></div>}
                  {selHotel.dateDepart && <div className="flex justify-between text-sm"><span className="text-[#A5A6A5]">Départ</span><span className="text-[#565556]">{fmtDate(selHotel.dateDepart)}</span></div>}
                  {selHotel.nombreNuits && <div className="flex justify-between text-sm"><span className="text-[#A5A6A5]">Nuits</span><span className="font-bold text-[#565556]">{selHotel.nombreNuits}</span></div>}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                <p className="text-xs text-[#A5A6A5] mb-2">Tarifs</p>
                <div className="space-y-2">
                  {selHotel.prixParNuit && <div className="flex justify-between text-sm"><span className="text-[#A5A6A5]">Prix/nuit</span><span className="text-[#565556]">{selHotel.prixParNuit.toLocaleString()} {selHotel.devise}</span></div>}
                  {selHotel.prixTotal && <div className="flex justify-between text-sm"><span className="text-[#A5A6A5]">Prix total</span><span className="font-bold text-[#565556]">{selHotel.prixTotal.toLocaleString()} {selHotel.devise}</span></div>}
                </div>
              </div>
            </div>

            {/* Section Statut */}
            <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
              <p className="text-xs text-[#A5A6A5] mb-2">Statut</p>
              {statutBadge(selHotel.statut)}
            </div>

            {/* Section Commentaire */}
            {selHotel.commentaire && (
              <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                <p className="text-xs text-[#A5A6A5] mb-2">Commentaire</p>
                <p className="text-sm text-[#565556]">{selHotel.commentaire}</p>
              </div>
            )}
          </ModalBody>
          <ModalFooter className="justify-between">
            <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 text-xs text-[#A5A6A5]">
              <span>Créé le {fmtDate(selHotel.createdAt)}</span>
              <span>Mis à jour le {fmtDate(selHotel.updatedAt)}</span>
            </div>
            <button
              onClick={() => {
                setShowHotelDetail(false);
                setSelHotel(null);
              }}
              className="px-5 py-2.5 rounded-lg text-sm font-medium bg-[#A11B1B] text-white hover:bg-[#8a1616] transition-colors"
            >
              Fermer
            </button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}
