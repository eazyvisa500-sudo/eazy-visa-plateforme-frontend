import { useEffect, useState } from 'react';
import {
  Plane, Hotel, Loader2, Eye, MapPin, ArrowRight,
  CheckCircle2, Ban, RefreshCw, User, Ticket,
  Search,
} from 'lucide-react';
import {
  getAllReservations,
  type ReservationBillet,
  type ReservationHotel,
} from '../../services/reservations';
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

export default function Reservation() {
  const [billets, setBillets] = useState<ReservationBillet[]>([]);
  const [hotels, setHotels] = useState<ReservationHotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showBilletDetail, setShowBilletDetail] = useState(false);
  const [showHotelDetail, setShowHotelDetail] = useState(false);
  const [selBillet, setSelBillet] = useState<ReservationBillet | null>(null);
  const [selHotel, setSelHotel] = useState<ReservationHotel | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await getAllReservations();
      setBillets(data.billets.data);
      setHotels(data.hotels.data);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filteredBillets = billets.filter((b) => {
    const matchesSearch =
      searchQuery === '' ||
      b.demandeVoyage.user?.nom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.demandeVoyage.user?.prenom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.demandeVoyage.user?.matricule?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.aeroportDepart?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.aeroportArrivee?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.numeroReservation?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || b.statut === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredHotels = hotels.filter((h) => {
    const matchesSearch =
      searchQuery === '' ||
      h.demandeVoyage.user?.nom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.demandeVoyage.user?.prenom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.demandeVoyage.user?.matricule?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.nomHotel?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.ville?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.numeroConfirmation?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || h.statut === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#A11B1B]/10 flex items-center justify-center">
            <Plane className="w-5 h-5 text-[#A11B1B]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#565556]">Toutes les réservations</h1>
            <p className="text-sm text-[#A5A6A5]">Billets et hôtels de toutes les entreprises</p>
          </div>
        </div>
        <button onClick={load} disabled={loading} className="p-2 rounded-lg border border-[#e5e5e5] text-[#565556] hover:bg-[#f4f4f4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors" title="Actualiser">
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && <ErrorAlert error={error} onDismiss={() => setError('')} />}

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex-1 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A5A6A5]" />
            <input
              type="text"
              placeholder="Rechercher par nom, matricule, aéroport, hôtel, numéro de réservation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10 bg-white"
          >
            <option value="all">Tous les statuts</option>
            <option value="EN_ATTENTE">En attente</option>
            <option value="CONFIRMEE">Confirmée</option>
            <option value="EMISE">Émise</option>
            <option value="ANNULEE">Annulée</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#A11B1B]" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Billets */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Plane className="w-5 h-5 text-[#A11B1B]" />
              <h2 className="text-lg font-semibold text-[#565556]">Billets ({filteredBillets.length})</h2>
            </div>
            {filteredBillets.length === 0 ? (
              <div className="p-8 rounded-xl bg-[#fafafa] border border-[#e5e5e5] text-center text-[#A5A6A5]">
                Aucun billet trouvé
              </div>
            ) : (
              <div className="rounded-xl border border-[#e5e5e5] overflow-hidden bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#e5e5e5] bg-[#fafafa]">
                        <th className="text-left px-4 py-3 font-medium text-[#565556]">Passager</th>
                        <th className="text-left px-4 py-3 font-medium text-[#565556]">Matricule</th>
                        <th className="text-left px-4 py-3 font-medium text-[#565556]">Trajet</th>
                        <th className="text-left px-4 py-3 font-medium text-[#565556]">Date</th>
                        <th className="text-left px-4 py-3 font-medium text-[#565556]">Classe</th>
                        <th className="text-left px-4 py-3 font-medium text-[#565556]">Prix</th>
                        <th className="text-left px-4 py-3 font-medium text-[#565556]">Statut</th>
                        <th className="text-left px-4 py-3 font-medium text-[#565556]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBillets.map((billet) => (
                        <tr key={billet.id} className="border-b border-[#e5e5e5] hover:bg-[#fafafa]">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-[#A5A6A5]" />
                              <div>
                                <p className="font-medium text-[#565556]">{billet.demandeVoyage.user?.prenom} {billet.demandeVoyage.user?.nom}</p>
                                {billet.demandeVoyage.entreprise && (
                                  <p className="text-xs text-[#A5A6A5]">{billet.demandeVoyage.entreprise.nom}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-[#565556]">{billet.demandeVoyage.user?.matricule}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 text-[#565556]">
                              <span>{billet.aeroportDepart}</span>
                              <ArrowRight className="w-3 h-3 text-[#A5A6A5]" />
                              <span>{billet.aeroportArrivee}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-[#565556]">{fmtDate(billet.dateVolDepart)}</td>
                          <td className="px-4 py-3">{classBadge(billet.classe)}</td>
                          <td className="px-4 py-3 text-[#565556]">
                            {billet.prix ? `${billet.prix.toLocaleString()} ${billet.devise}` : '—'}
                          </td>
                          <td className="px-4 py-3">{statutBadge(billet.statut)}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => {
                                setSelBillet(billet);
                                setShowBilletDetail(true);
                              }}
                              className="p-1.5 rounded-md hover:bg-[#f4f4f4] text-[#565556] transition-colors"
                              title="Voir les détails"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Hôtels */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Hotel className="w-5 h-5 text-[#A11B1B]" />
              <h2 className="text-lg font-semibold text-[#565556]">Hôtels ({filteredHotels.length})</h2>
            </div>
            {filteredHotels.length === 0 ? (
              <div className="p-8 rounded-xl bg-[#fafafa] border border-[#e5e5e5] text-center text-[#A5A6A5]">
                Aucun hôtel trouvé
              </div>
            ) : (
              <div className="rounded-xl border border-[#e5e5e5] overflow-hidden bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#e5e5e5] bg-[#fafafa]">
                        <th className="text-left px-4 py-3 font-medium text-[#565556]">Passager</th>
                        <th className="text-left px-4 py-3 font-medium text-[#565556]">Matricule</th>
                        <th className="text-left px-4 py-3 font-medium text-[#565556]">Hôtel</th>
                        <th className="text-left px-4 py-3 font-medium text-[#565556]">Ville</th>
                        <th className="text-left px-4 py-3 font-medium text-[#565556]">Dates</th>
                        <th className="text-left px-4 py-3 font-medium text-[#565556]">Prix</th>
                        <th className="text-left px-4 py-3 font-medium text-[#565556]">Statut</th>
                        <th className="text-left px-4 py-3 font-medium text-[#565556]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHotels.map((hotel) => (
                        <tr key={hotel.id} className="border-b border-[#e5e5e5] hover:bg-[#fafafa]">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-[#A5A6A5]" />
                              <div>
                                <p className="font-medium text-[#565556]">{hotel.demandeVoyage.user?.prenom} {hotel.demandeVoyage.user?.nom}</p>
                                {hotel.demandeVoyage.entreprise && (
                                  <p className="text-xs text-[#A5A6A5]">{hotel.demandeVoyage.entreprise.nom}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-[#565556]">{hotel.demandeVoyage.user?.matricule}</td>
                          <td className="px-4 py-3 text-[#565556]">{hotel.nomHotel || '—'}</td>
                          <td className="px-4 py-3 text-[#565556]">{hotel.ville}</td>
                          <td className="px-4 py-3 text-[#565556]">
                            {hotel.dateArrivee && hotel.dateDepart
                              ? `${fmtDate(hotel.dateArrivee)} - ${fmtDate(hotel.dateDepart)}`
                              : '—'}
                          </td>
                          <td className="px-4 py-3 text-[#565556]">
                            {hotel.prixTotal ? `${hotel.prixTotal.toLocaleString()} ${hotel.devise}` : '—'}
                          </td>
                          <td className="px-4 py-3">{statutBadge(hotel.statut)}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => {
                                setSelHotel(hotel);
                                setShowHotelDetail(true);
                              }}
                              className="p-1.5 rounded-md hover:bg-[#f4f4f4] text-[#565556] transition-colors"
                              title="Voir les détails"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Billet Detail Modal */}
      {showBilletDetail && selBillet && (
        <Modal
          isOpen={showBilletDetail}
          onClose={() => setShowBilletDetail(false)}
          size="xl"
        >
          <ModalHeader
            title="Détails du billet"
            subtitle={selBillet.numeroReservation}
            icon={<Ticket className="w-5 h-5 text-white" />}
            variant="brand"
          />
          <ModalBody className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                <p className="text-xs text-[#A5A6A5] mb-1">Passager</p>
                <p className="text-sm font-medium text-[#565556]">{selBillet.demandeVoyage.user?.prenom} {selBillet.demandeVoyage.user?.nom}</p>
              </div>
              <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                <p className="text-xs text-[#A5A6A5] mb-1">Matricule</p>
                <p className="text-sm font-medium text-[#565556]">{selBillet.demandeVoyage.user?.matricule}</p>
              </div>
              <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                <p className="text-xs text-[#A5A6A5] mb-1">Entreprise</p>
                <p className="text-sm font-medium text-[#565556]">{selBillet.demandeVoyage.entreprise?.nom || '—'}</p>
              </div>
              <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                <p className="text-xs text-[#A5A6A5] mb-1">Statut</p>
                {statutBadge(selBillet.statut)}
              </div>
            </div>

            <div className="p-5 rounded-xl bg-gradient-to-br from-[#A11B1B]/5 to-[#8a1616]/5 border border-[#A11B1B]/10">
              <h4 className="text-sm font-semibold text-[#565556] flex items-center gap-2 mb-4">
                <MapPin className="w-4 h-4 text-[#A11B1B]" />Vol
              </h4>
              <div className="flex items-center gap-4 mb-4 text-sm">
                <span className="text-[#565556]">{selBillet.aeroportDepart}</span>
                <ArrowRight className="w-4 h-4 text-[#A5A6A5]" />
                <span className="text-[#565556]">{selBillet.aeroportArrivee}</span>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-[#A5A6A5]">Départ: {fmtDateTime(selBillet.dateVolDepart)}</p>
                {selBillet.dateVolArrivee && (
                  <p className="text-xs text-[#A5A6A5]">Arrivée: {fmtDateTime(selBillet.dateVolArrivee)}</p>
                )}
                {selBillet.allerRetour && selBillet.dateVolRetourDepart && (
                  <>
                    <p className="text-xs text-[#A5A6A5] mt-2">Retour départ: {fmtDateTime(selBillet.dateVolRetourDepart)}</p>
                    {selBillet.dateVolRetourArrivee && (
                      <p className="text-xs text-[#A5A6A5]">Retour arrivée: {fmtDateTime(selBillet.dateVolRetourArrivee)}</p>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                <p className="text-xs text-[#A5A6A5] mb-1">Classe</p>
                {classBadge(selBillet.classe)}
              </div>
              <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                <p className="text-xs text-[#A5A6A5] mb-1">Prix</p>
                <p className="text-sm font-medium text-[#565556]">{selBillet.prix ? `${selBillet.prix.toLocaleString()} ${selBillet.devise}` : '—'}</p>
              </div>
            </div>

            {selBillet.numeroBillet && (
              <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                <p className="text-xs text-[#A5A6A5] mb-1">Numéro de billet</p>
                <p className="font-mono text-lg font-bold text-[#565556]">{selBillet.numeroBillet}</p>
              </div>
            )}

            {selBillet.commentaire && (
              <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                <p className="text-xs text-[#A5A6A5] mb-1">Commentaire</p>
                <p className="text-sm text-[#565556]">{selBillet.commentaire}</p>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <button
              onClick={() => setShowBilletDetail(false)}
              className="px-5 py-2.5 rounded-lg text-sm font-medium bg-[#A11B1B] text-white hover:bg-[#8a1616] transition-colors"
            >
              Fermer
            </button>
          </ModalFooter>
        </Modal>
      )}

      {/* Hotel Detail Modal */}
      {showHotelDetail && selHotel && (
        <Modal
          isOpen={showHotelDetail}
          onClose={() => setShowHotelDetail(false)}
          size="xl"
        >
          <ModalHeader
            title="Détails de l'hôtel"
            subtitle={selHotel.nomHotel || 'Hôtel'}
            icon={<Hotel className="w-5 h-5 text-white" />}
            variant="brand"
          />
          <ModalBody className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                <p className="text-xs text-[#A5A6A5] mb-1">Passager</p>
                <p className="text-sm font-medium text-[#565556]">{selHotel.demandeVoyage.user?.prenom} {selHotel.demandeVoyage.user?.nom}</p>
              </div>
              <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                <p className="text-xs text-[#A5A6A5] mb-1">Matricule</p>
                <p className="text-sm font-medium text-[#565556]">{selHotel.demandeVoyage.user?.matricule}</p>
              </div>
              <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                <p className="text-xs text-[#A5A6A5] mb-1">Entreprise</p>
                <p className="text-sm font-medium text-[#565556]">{selHotel.demandeVoyage.entreprise?.nom || '—'}</p>
              </div>
              <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                <p className="text-xs text-[#A5A6A5] mb-1">Statut</p>
                {statutBadge(selHotel.statut)}
              </div>
            </div>

            <div className="p-5 rounded-xl bg-gradient-to-br from-[#A11B1B]/5 to-[#8a1616]/5 border border-[#A11B1B]/10">
              <h4 className="text-sm font-semibold text-[#565556] flex items-center gap-2 mb-4">
                <Hotel className="w-4 h-4 text-[#A11B1B]" />Hôtel
              </h4>
              <div className="space-y-2">
                <p className="text-sm font-medium text-[#565556]">{selHotel.nomHotel || '—'}</p>
                <p className="text-xs text-[#A5A6A5]">Catégorie: {selHotel.categorie} {selHotel.categorie === '1' ? 'étoile' : 'étoiles'}</p>
                {selHotel.adresse && <p className="text-xs text-[#A5A6A5]">Adresse: {selHotel.adresse}</p>}
                <p className="text-xs text-[#A5A6A5]">Ville: {selHotel.ville}</p>
                {selHotel.pays && <p className="text-xs text-[#A5A6A5]">Pays: {selHotel.pays}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                <p className="text-xs text-[#A5A6A5] mb-1">Date d'arrivée</p>
                <p className="text-sm font-medium text-[#565556]">{selHotel.dateArrivee ? fmtDate(selHotel.dateArrivee) : '—'}</p>
              </div>
              <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                <p className="text-xs text-[#A5A6A5] mb-1">Date de départ</p>
                <p className="text-sm font-medium text-[#565556]">{selHotel.dateDepart ? fmtDate(selHotel.dateDepart) : '—'}</p>
              </div>
              <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                <p className="text-xs text-[#A5A6A5] mb-1">Nombre de nuits</p>
                <p className="text-sm font-medium text-[#565556]">{selHotel.nombreNuits || '—'}</p>
              </div>
              <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                <p className="text-xs text-[#A5A6A5] mb-1">Prix total</p>
                <p className="text-sm font-medium text-[#565556]">{selHotel.prixTotal ? `${selHotel.prixTotal.toLocaleString()} ${selHotel.devise}` : '—'}</p>
              </div>
            </div>

            {selHotel.numeroConfirmation && (
              <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                <p className="text-xs text-[#A5A6A5] mb-1">Numéro de confirmation</p>
                <p className="font-mono text-lg font-bold text-[#565556]">{selHotel.numeroConfirmation}</p>
              </div>
            )}

            {selHotel.commentaire && (
              <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                <p className="text-xs text-[#A5A6A5] mb-1">Commentaire</p>
                <p className="text-sm text-[#565556]">{selHotel.commentaire}</p>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <button
              onClick={() => setShowHotelDetail(false)}
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
