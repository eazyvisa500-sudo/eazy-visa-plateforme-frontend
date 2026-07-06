import { useEffect, useState } from 'react';
import {
  Plane, Hotel, Loader2, AlertTriangle, Eye, Calendar, MapPin, ArrowRight,
  CheckCircle2, XCircle, Ban, RefreshCw, User, Building2, Ticket,
} from 'lucide-react';
import {
  getReservationsEntreprise,
  type ReservationBillet,
  type ReservationHotel,
} from '../../services/reservations';
import {
  searchFlights,
  bookFlight,
  formatDuration,
  formatDateTime,
  type FlightSearchRequest,
  type FlightSearchResponse,
  type BookingRequest,
  type BookingResponse,
} from '../../services/flights';

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

export default function Reservations() {
  const [billets, setBillets] = useState<ReservationBillet[]>([]);
  const [hotels, setHotels] = useState<ReservationHotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showBilletDetail, setShowBilletDetail] = useState(false);
  const [showHotelDetail, setShowHotelDetail] = useState(false);
  const [showFlightSearch, setShowFlightSearch] = useState(false);
  const [selBillet, setSelBillet] = useState<ReservationBillet | null>(null);
  const [selHotel, setSelHotel] = useState<ReservationHotel | null>(null);

  // Flight search states
  const [searchOrigin, setSearchOrigin] = useState('');
  const [searchDestination, setSearchDestination] = useState('');
  const [searchDepartureDate, setSearchDepartureDate] = useState('');
  const [searchReturnDate, setSearchReturnDate] = useState('');
  const [searchPassengers, setSearchPassengers] = useState(1);
  const [searchCabinClass, setSearchCabinClass] = useState('economy');
  const [searchMaxStops, setSearchMaxStops] = useState(2);
  const [searchLimit, setSearchLimit] = useState(20);
  const [searchOffset, setSearchOffset] = useState(0);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [searchResults, setSearchResults] = useState<FlightSearchResponse | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<any | null>(null);

  // Booking states
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState<BookingResponse | null>(null);
  const [currentMatricule, setCurrentMatricule] = useState('');

  async function load() {
    setLoading(true); setError('');
    try {
      const res = await getReservationsEntreprise();
      setBillets(res.billets.data);
      setHotels(res.hotels.data);
    } catch (err: unknown) {
      const msg = (err as Error & { data?: { message?: string } }).data?.message || 'Erreur de chargement';
      setError(msg);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  function openFlightSearch(billet: ReservationBillet) {
    console.log('Données du billet pour recherche de vol:', billet);

    // Store matricule from demandeVoyage
    setCurrentMatricule(billet.demandeVoyage.matricule);

    // Pre-fill search form with reservation data
    setSearchOrigin(billet.aeroportDepart);
    setSearchDestination(billet.aeroportArrivee);
    setSearchDepartureDate(billet.dateVolDepart.slice(0, 10));
    setSearchReturnDate(billet.allerRetour && billet.dateVolRetourDepart ? billet.dateVolRetourDepart.slice(0, 10) : '');
    setSearchPassengers(1);

    // Map classe to cabin class
    const classMap: Record<string, string> = { Y: 'economy', W: 'premium_economy', J: 'business', F: 'first' };
    setSearchCabinClass(classMap[billet.classe] || 'economy');

    setShowFlightSearch(true);
  }

  function resetFlightSearch() {
    setSearchOrigin('');
    setSearchDestination('');
    setSearchDepartureDate('');
    setSearchReturnDate('');
    setSearchPassengers(1);
    setSearchCabinClass('economy');
    setSearchMaxStops(2);
    setSearchLimit(20);
    setSearchOffset(0);
    setSearchError('');
    setSearchResults(null);
  }

  async function handleFlightSearch() {
    if (!searchOrigin || !searchDestination || !searchDepartureDate) {
      setSearchError('Les champs aéroport de départ, aéroport d\'arrivée et date de départ sont requis');
      return;
    }

    setSearchLoading(true);
    setSearchError('');
    setSearchResults(null);

    try {
      const request: FlightSearchRequest = {
        origin: searchOrigin,
        destination: searchDestination,
        departureDate: searchDepartureDate,
        returnDate: searchReturnDate || undefined,
        passengers: searchPassengers,
        cabinClass: searchCabinClass,
        maxStops: searchMaxStops,
        limit: searchLimit,
        offset: searchOffset,
      };

      const results = await searchFlights(request);
      setSearchResults(results);
    } catch (error) {
      const msg = (error as Error).message || 'Erreur lors de la recherche de vols';
      setSearchError(msg);
    } finally {
      setSearchLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#A11B1B]/10 flex items-center justify-center">
            <Plane className="w-5 h-5 text-[#A11B1B]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#565556]">Réservations</h1>
            <p className="text-sm text-[#A5A6A5]">Billets et hôtels de l'entreprise</p>
          </div>
        </div>
        <button onClick={load} disabled={loading} className="p-2 rounded-lg hover:bg-[#f4f4f4] text-[#565556] disabled:opacity-60" title="Actualiser">
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
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
                      {['Employé', 'Trajet', 'Dates', 'Classe', 'Statut', 'Actions'].map((h) => (
                        <th key={h} className={`px-4 py-2.5 font-medium text-[#565556] ${h === 'Actions' ? 'text-right' : 'text-left'}`}>
                          <span>{h}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {billets.map((b) => (
                      <tr key={b.id} className="border-b border-[#f0f0f0]">
                        <td className="px-4 py-2.5 text-[#565556]">{b.demandeVoyage.user?.prenom} {b.demandeVoyage.user?.nom}<div className="text-xs text-[#A5A6A5]">{b.demandeVoyage.user?.matricule}</div></td>
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
                            {b.statut !== 'EMISE' && (
                              <button onClick={() => { openFlightSearch(b); }} className="p-1.5 rounded-md hover:bg-[#f4f4f4] text-[#565556]" title="Rechercher vol"><Ticket className="w-4 h-4" /></button>
                            )}
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
                      {['Employé','Hôtel', 'Ville', 'Catégorie', 'Statut', 'Actions'].map((h) => (
                        <th key={h} className={`px-4 py-2.5 font-medium text-[#565556] ${h === 'Actions' ? 'text-right' : 'text-left'}`}>
                          <span>{h}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {hotels.map((h) => (
                      <tr key={h.id} className="border-b border-[#f0f0f0]">
                        <td className="px-4 py-2.5 text-[#565556]">{h.demandeVoyage.user?.prenom} {h.demandeVoyage.user?.nom}<div className="text-xs text-[#A5A6A5]">{h.demandeVoyage.user?.matricule}</div></td>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-8">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-[#A11B1B] to-[#8a1616] px-8 py-6 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Plane className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Détail du billet</h3>
                  <p className="text-white/80 text-sm">{selBillet.numeroReservation}</p>
                </div>
              </div>
              <button onClick={() => { setShowBilletDetail(false); setSelBillet(null); }} className="p-2 rounded-lg hover:bg-white/20 text-white transition-colors"><XCircle className="w-6 h-6" /></button>
            </div>
            <div className="p-8 space-y-6">
              {/* Section Employé & Entreprise */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#A11B1B]/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-[#A11B1B]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#A5A6A5]">Employé</p>
                    <p className="text-sm font-medium text-[#565556]">{selBillet.demandeVoyage.user?.prenom} {selBillet.demandeVoyage.user?.nom}</p>
                    <p className="text-xs text-[#A5A6A5]">{selBillet.demandeVoyage.user?.matricule}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#A11B1B]/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-[#A11B1B]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#A5A6A5]">Entreprise</p>
                    <p className="text-sm font-medium text-[#565556]">{selBillet.demandeVoyage.entreprise?.nom}</p>
                    <p className="text-xs text-[#A5A6A5]">{selBillet.demandeVoyage.entreprise?.identifiant}</p>
                  </div>
                </div>
              </div>

              {/* Section Trajet */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-[#A11B1B]/5 to-[#8a1616]/5 border border-[#A11B1B]/10">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-[#565556] flex items-center gap-2"><MapPin className="w-4 h-4 text-[#A11B1B]" />Trajet</h4>
                  {selBillet.allerRetour && <span className="px-2 py-1 rounded-full bg-[#A11B1B]/10 text-[#A11B1B] text-xs font-medium">Aller-retour</span>}
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                    <div className="grid grid-cols-2 gap-4">
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
              <div className="grid grid-cols-2 gap-4">
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
              <div className="grid grid-cols-2 gap-4">
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

              <div className="flex justify-between text-xs text-[#A5A6A5] pt-4 border-t border-[#e5e5e5]">
                <span>Créé le {fmtDate(selBillet.createdAt)}</span>
                <span>Mis à jour le {fmtDate(selBillet.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal détail hôtel */}
      {showHotelDetail && selHotel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-8">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-[#A11B1B] to-[#8a1616] px-8 py-6 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Hotel className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Détail de l'hôtel</h3>
                  <p className="text-white/80 text-sm">{selHotel.numeroConfirmation || 'En attente'}</p>
                </div>
              </div>
              <button onClick={() => { setShowHotelDetail(false); setSelHotel(null); }} className="p-2 rounded-lg hover:bg-white/20 text-white transition-colors"><XCircle className="w-6 h-6" /></button>
            </div>
            <div className="p-8 space-y-6">
              {/* Section Employé & Entreprise */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#A11B1B]/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-[#A11B1B]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#A5A6A5]">Employé</p>
                    <p className="text-sm font-medium text-[#565556]">{selHotel.demandeVoyage.user?.prenom} {selHotel.demandeVoyage.user?.nom}</p>
                    <p className="text-xs text-[#A5A6A5]">{selHotel.demandeVoyage.user?.matricule}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#A11B1B]/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-[#A11B1B]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#A5A6A5]">Entreprise</p>
                    <p className="text-sm font-medium text-[#565556]">{selHotel.demandeVoyage.entreprise?.nom}</p>
                    <p className="text-xs text-[#A5A6A5]">{selHotel.demandeVoyage.entreprise?.identifiant}</p>
                  </div>
                </div>
              </div>

              {/* Section Hôtel */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-[#A11B1B]/5 to-[#8a1616]/5 border border-[#A11B1B]/10">
                <h4 className="text-sm font-semibold text-[#565556] flex items-center gap-2 mb-4"><Hotel className="w-4 h-4 text-[#A11B1B]" />Informations hôtel</h4>
                <div className="grid grid-cols-2 gap-4">
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
              <div className="grid grid-cols-2 gap-4">
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

              <div className="flex justify-between text-xs text-[#A5A6A5] pt-4 border-t border-[#e5e5e5]">
                <span>Créé le {fmtDate(selHotel.createdAt)}</span>
                <span>Mis à jour le {fmtDate(selHotel.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal recherche de vol */}
      {showFlightSearch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-8">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-[#A11B1B] to-[#8a1616] px-8 py-6 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Ticket className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Rechercher un vol</h3>
                  <p className="text-white/80 text-sm">Trouvez des vols correspondants à cette réservation</p>
                </div>
              </div>
              <button onClick={() => { setShowFlightSearch(false); resetFlightSearch(); }} className="p-2 rounded-lg hover:bg-white/20 text-white transition-colors"><XCircle className="w-6 h-6" /></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-[#565556]">Aéroport de départ (IATA)</label>
                  <input
                    type="text"
                    value={searchOrigin}
                    onChange={(e) => setSearchOrigin(e.target.value)}
                    placeholder="Ex: DKR"
                    className="px-3 py-2.5 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10 bg-white"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-[#565556]">Aéroport d'arrivée (IATA)</label>
                  <input
                    type="text"
                    value={searchDestination}
                    onChange={(e) => setSearchDestination(e.target.value)}
                    placeholder="Ex: CDG"
                    className="px-3 py-2.5 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-[#565556]">Date de départ</label>
                  <input
                    type="date"
                    value={searchDepartureDate}
                    onChange={(e) => setSearchDepartureDate(e.target.value)}
                    className="px-3 py-2.5 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10 bg-white"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-[#565556]">Date de retour (optionnel)</label>
                  <input
                    type="date"
                    value={searchReturnDate}
                    onChange={(e) => setSearchReturnDate(e.target.value)}
                    className="px-3 py-2.5 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-[#565556]">Nombre de passagers</label>
                  <input
                    type="number"
                    min="1"
                    max="9"
                    value={searchPassengers}
                    onChange={(e) => setSearchPassengers(parseInt(e.target.value) || 1)}
                    className="px-3 py-2.5 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10 bg-white"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-[#565556]">Classe de cabine</label>
                  <select
                    value={searchCabinClass}
                    onChange={(e) => setSearchCabinClass(e.target.value)}
                    className="px-3 py-2.5 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10 bg-white"
                  >
                    <option value="economy">Économique</option>
                    <option value="premium_economy">Premium Économique</option>
                    <option value="business">Affaires</option>
                    <option value="first">Première</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-[#565556]">Max escales</label>
                  <select
                    value={searchMaxStops}
                    onChange={(e) => setSearchMaxStops(parseInt(e.target.value))}
                    className="px-3 py-2.5 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10 bg-white"
                  >
                    <option value="0">Direct (0)</option>
                    <option value="1">1 escale max</option>
                    <option value="2">2 escales max</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-[#565556]">Résultats par page</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={searchLimit}
                    onChange={(e) => setSearchLimit(parseInt(e.target.value) || 20)}
                    className="px-3 py-2.5 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10 bg-white"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-[#565556]">Offset (pagination)</label>
                  <input
                    type="number"
                    min="0"
                    value={searchOffset}
                    onChange={(e) => setSearchOffset(parseInt(e.target.value) || 0)}
                    className="px-3 py-2.5 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] outline-none focus:border-[#A11B1B] focus:ring-2 focus:ring-[#A11B1B]/10 bg-white"
                  />
                </div>
              </div>

              {searchError && (
                <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                  {searchError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-[#e5e5e5]">
                <button
                  onClick={() => { setShowFlightSearch(false); resetFlightSearch(); }}
                  className="px-5 py-2.5 rounded-lg text-sm font-medium text-[#565556] hover:bg-[#f4f4f4] transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleFlightSearch}
                  disabled={searchLoading}
                  className="px-5 py-2.5 rounded-lg bg-[#A11B1B] text-white text-sm font-medium hover:bg-[#8a1616] transition-colors disabled:opacity-60 flex items-center gap-2"
                >
                  {searchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {searchLoading ? 'Recherche...' : 'Rechercher'}
                </button>
              </div>

              {/* Search Results */}
              {searchResults && (
                <div className="mt-6 pt-6 border-t border-[#e5e5e5]">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-[#565556]">Résultats ({searchResults.offers.length} offres trouvées)</h4>
                    <span className="text-xs text-[#A5A6A5]">Total: {searchResults.pagination.total} offres</span>
                  </div>
                  {searchResults.offers.length === 0 ? (
                    <div className="text-center py-8 text-[#A5A6A5]">
                      <Plane className="w-10 h-10 mx-auto mb-3 text-[#e5e5e5]" />
                      <p className="text-sm">Aucun vol trouvé pour ces critères</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4">
                        {searchResults.offers.map((offer) => (
                        <div key={offer.id} className="p-5 rounded-xl bg-gradient-to-br from-[#fafafa] to-white border border-[#e5e5e5] hover:border-[#A11B1B]/30 transition-colors">
                          {/* Header with airline and price */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              {offer.owner.logo_symbol_url && (
                                <img src={offer.owner.logo_symbol_url} alt={offer.owner.name} className="w-12 h-12 rounded-xl object-contain bg-white p-2 shadow-sm" />
                              )}
                              <div>
                                <p className="text-sm font-semibold text-[#565556]">{offer.owner.name}</p>
                                <p className="text-xs text-[#A5A6A5]">Offre {offer.id.slice(-8)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className="text-2xl font-bold text-[#A11B1B]">{parseFloat(offer.total_amount).toLocaleString()} {offer.total_currency}</p>
                                <p className="text-xs text-[#A5A6A5]">Total TTC</p>
                              </div>
                              <button
                                onClick={() => setSelectedOffer(offer)}
                                className="p-2 rounded-lg hover:bg-[#e5e5e5] text-[#565556] transition-colors"
                                title="Voir les détails"
                              >
                                <Eye className="w-5 h-5" />
                              </button>
                            </div>
                          </div>

                          {/* Flight details */}
                          <div className="space-y-3">
                            {offer.slices.map((slice, _sliceIndex) => (
                              <div key={slice.id} className="p-4 rounded-lg bg-white border border-[#e5e5e5]">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-[#A11B1B]" />
                                    <div className="text-sm">
                                      <span className="font-medium text-[#565556]">{slice.origin.city_name}</span>
                                      <span className="text-[#A5A6A5] mx-1">({slice.origin.iata_code})</span>
                                      <span className="text-[#A5A6A5]">→</span>
                                      <span className="font-medium text-[#565556] ml-1">{slice.destination.city_name}</span>
                                      <span className="text-[#A5A6A5] mx-1">({slice.destination.iata_code})</span>
                                    </div>
                                  </div>
                                  <span className="text-xs text-[#A5A6A5]">{formatDuration(slice.duration)}</span>
                                </div>

                                {/* Segments */}
                                <div className="space-y-2">
                                  {slice.segments.map((segment, _segIndex) => (
                                    <div key={segment.id} className="flex items-center gap-3 text-sm">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <div className="text-left">
                                            <p className="font-medium text-[#565556]">{segment.origin.city_name}</p>
                                            <p className="text-xs text-[#A5A6A5]">{segment.origin.name} ({segment.origin.iata_code})</p>
                                          </div>
                                          <ArrowRight className="w-4 h-4 text-[#A5A6A5] flex-shrink-0" />
                                          <div className="text-left">
                                            <p className="font-medium text-[#565556]">{segment.destination.city_name}</p>
                                            <p className="text-xs text-[#A5A6A5]">{segment.destination.name} ({segment.destination.iata_code})</p>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2 text-xs text-[#A5A6A5]">
                                          <span>{formatDateTime(segment.departing_at)}</span>
                                          <span>→</span>
                                          <span>{formatDateTime(segment.arriving_at)}</span>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-xs text-[#565556]">{segment.operating_carrier.name}</p>
                                        <p className="text-xs text-[#A5A6A5]">Vol {segment.operating_carrier_flight_number}</p>
                                        {segment.aircraft && (
                                          <p className="text-xs text-[#A5A6A5]">{segment.aircraft.name}</p>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Price breakdown */}
                          <div className="mt-4 pt-4 border-t border-[#e5e5e5] grid grid-cols-3 gap-3 text-xs">
                            <div className="p-2 rounded bg-[#fafafa]">
                              <p className="text-[#A5A6A5]">Prix de base</p>
                              <p className="font-medium text-[#565556]">{parseFloat(offer.base_amount).toLocaleString()} {offer.base_currency}</p>
                            </div>
                            <div className="p-2 rounded bg-[#fafafa]">
                              <p className="text-[#A5A6A5]">Taxes</p>
                              <p className="font-medium text-[#565556]">{parseFloat(offer.tax_amount).toLocaleString()} {offer.tax_currency}</p>
                            </div>
                            <div className="p-2 rounded bg-[#fafafa]">
                              <p className="text-[#A5A6A5]">Émissions CO₂</p>
                              <p className="font-medium text-[#565556]">{parseFloat(offer.total_emissions_kg).toLocaleString()} kg</p>
                            </div>
                          </div>

                          {/* Conditions */}
                          <div className="mt-3 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              {offer.conditions.refund_before_departure?.allowed && (
                                <span className="px-2 py-1 rounded-full bg-green-50 text-green-700 font-medium">Remboursable</span>
                              )}
                              {offer.conditions.change_before_departure?.allowed && (
                                <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">Modifiable</span>
                              )}
                            </div>
                            <span className="text-[#A5A6A5]">Expire: {formatDateTime(offer.expires_at)}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between pt-4 border-t border-[#e5e5e5]">
                      <div className="text-xs text-[#A5A6A5]">
                        Page {Math.floor(searchResults.pagination.offset / searchResults.pagination.limit) + 1} sur {Math.ceil(searchResults.pagination.total / searchResults.pagination.limit)}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const newOffset = Math.max(0, searchResults.pagination.offset - searchResults.pagination.limit);
                            setSearchOffset(newOffset);
                            handleFlightSearch();
                          }}
                          disabled={searchResults.pagination.offset === 0}
                          className="px-4 py-2 rounded-lg text-sm font-medium text-[#565556] hover:bg-[#f4f4f4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Précédent
                        </button>
                        <button
                          onClick={() => {
                            const newOffset = searchResults.pagination.offset + searchResults.pagination.limit;
                            setSearchOffset(newOffset);
                            handleFlightSearch();
                          }}
                          disabled={!searchResults.pagination.has_more}
                          className="px-4 py-2 rounded-lg bg-[#A11B1B] text-white text-sm font-medium hover:bg-[#8a1616] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Suivant
                        </button>
                      </div>
                    </div>
                  </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal détail offre */}
      {selectedOffer && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-8">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-[#A11B1B] to-[#8a1616] px-8 py-6 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Ticket className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Détails de l'offre</h3>
                  <p className="text-white/80 text-sm">Offre {selectedOffer.id.slice(-8)}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOffer(null)}
                className="p-2 rounded-lg hover:bg-white/20 text-white transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
              <button
                onClick={() => {
                  console.log('Offre sélectionnée pour réservation:', selectedOffer);
                  setShowBookingModal(true);
                }}
                className="px-4 py-2 rounded-lg bg-white text-[#A11B1B] text-sm font-medium hover:bg-white/90 transition-colors"
              >
                Réserver
              </button>
            </div>

            <div className="p-8">
              {/* Airline info */}
              <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                {selectedOffer.owner.logo_symbol_url && (
                  <img src={selectedOffer.owner.logo_symbol_url} alt={selectedOffer.owner.name} className="w-16 h-16 rounded-xl object-contain bg-white p-2 shadow-sm" />
                )}
                <div className="flex-1">
                  <p className="text-lg font-semibold text-[#565556]">{selectedOffer.owner.name}</p>
                  <p className="text-sm text-[#A5A6A5]">Code IATA: {selectedOffer.owner.iata_code}</p>
                  {selectedOffer.owner.conditions_of_carriage_url && (
                    <a href={selectedOffer.owner.conditions_of_carriage_url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#A11B1B] hover:underline">
                      Conditions de transport
                    </a>
                  )}
                </div>
                <div className="text-right text-xs text-[#A5A6A5]">
                  {selectedOffer.live_mode !== undefined && (
                    <p>Mode: {selectedOffer.live_mode ? 'Live' : 'Test'}</p>
                  )}
                  {selectedOffer.partial !== undefined && (
                    <p>Offre partielle: {selectedOffer.partial ? 'Oui' : 'Non'}</p>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-[#A11B1B]/5 to-[#8a1616]/5 border border-[#A11B1B]/20">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-[#A5A6A5]">Prix de base</p>
                    <p className="text-lg font-semibold text-[#565556]">{parseFloat(selectedOffer.base_amount).toLocaleString()} {selectedOffer.base_currency}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#A5A6A5]">Taxes</p>
                    <p className="text-lg font-semibold text-[#565556]">{parseFloat(selectedOffer.tax_amount).toLocaleString()} {selectedOffer.tax_currency}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#A5A6A5]">Total TTC</p>
                    <p className="text-2xl font-bold text-[#A11B1B]">{parseFloat(selectedOffer.total_amount).toLocaleString()} {selectedOffer.total_currency}</p>
                  </div>
                </div>
              </div>

              {/* Slices */}
              <div className="space-y-4 mb-6">
                <h4 className="text-sm font-semibold text-[#565556]">Trajets</h4>
                {selectedOffer.slices.map((slice: any, index: number) => (
                  <div key={slice.id} className="p-4 rounded-xl bg-white border border-[#e5e5e5]">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-[#A11B1B]" />
                        <span className="text-base font-medium text-[#565556]">
                          {slice.origin.city_name} ({slice.origin.iata_code}) → {slice.destination.city_name} ({slice.destination.iata_code})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-[#A5A6A5]">{formatDuration(slice.duration)}</span>
                        {slice.fare_brand_name && (
                          <span className="px-2 py-1 rounded-full bg-[#A11B1B]/10 text-[#A11B1B] text-xs font-medium">{slice.fare_brand_name}</span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {slice.segments.map((segment: any, segIndex: number) => (
                        <div key={segment.id} className="p-3 rounded-lg bg-[#fafafa] border border-[#e5e5e5]">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="text-left">
                                  <p className="font-medium text-[#565556]">{segment.origin.city_name}</p>
                                  <p className="text-xs text-[#A5A6A5]">{segment.origin.name} ({segment.origin.iata_code})</p>
                                  <p className="text-xs text-[#A5A6A5]">{formatDateTime(segment.departing_at)}</p>
                                </div>
                                <ArrowRight className="w-5 h-5 text-[#A5A6A5] flex-shrink-0 mt-2" />
                                <div className="text-left">
                                  <p className="font-medium text-[#565556]">{segment.destination.city_name}</p>
                                  <p className="text-xs text-[#A5A6A5]">{segment.destination.name} ({segment.destination.iata_code})</p>
                                  <p className="text-xs text-[#A5A6A5]">{formatDateTime(segment.arriving_at)}</p>
                                </div>
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <p className="text-sm font-medium text-[#565556]">{segment.operating_carrier.name}</p>
                              <p className="text-xs text-[#A5A6A5]">Vol {segment.operating_carrier_flight_number}</p>
                              {segment.aircraft && (
                                <p className="text-xs text-[#A5A6A5]">{segment.aircraft.name}</p>
                              )}
                              {segment.origin_terminal && (
                                <p className="text-xs text-[#A5A6A5]">Terminal {segment.origin_terminal}</p>
                              )}
                            </div>
                          </div>

                          {/* Cabin and baggage info */}
                          {segment.passengers && segment.passengers.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-[#e5e5e5]">
                              <p className="text-xs font-medium text-[#565556] mb-2">Classe et bagages</p>
                              <div className="flex flex-wrap items-center gap-4 text-xs">
                                <span className="text-[#A5A6A5]">Classe: {segment.passengers[0].cabin_class_marketing_name}</span>
                                {segment.passengers[0].baggages && segment.passengers[0].baggages.length > 0 && (
                                  <span className="text-[#A5A6A5]">
                                    Bagages: {segment.passengers[0].baggages.map((b: any) => `${b.type} x${b.quantity}`).join(', ')}
                                  </span>
                                )}
                                {segment.passengers[0].fare_basis_code && (
                                  <span className="text-[#A5A6A5]">Fare: {segment.passengers[0].fare_basis_code}</span>
                                )}
                              </div>
                              {segment.passengers[0].cabin?.amenities && (
                                <div className="mt-2 text-xs text-[#A5A6A5]">
                                  <span>Siège: {segment.passengers[0].cabin.amenities.seat.type} (pitch: {segment.passengers[0].cabin.amenities.seat.pitch})</span>
                                  {segment.passengers[0].cabin.amenities.wifi?.available && <span> • WiFi: {segment.passengers[0].cabin.amenities.wifi.cost}</span>}
                                  {segment.passengers[0].cabin.amenities.power?.available && <span> • Prises: Oui</span>}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Distance */}
                          {segment.distance && (
                            <div className="mt-2 text-xs text-[#A5A6A5]">
                              Distance: {parseFloat(segment.distance).toLocaleString()} km
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Conditions */}
              <div className="mb-6 p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                <h4 className="text-sm font-semibold text-[#565556] mb-3">Conditions</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-[#A5A6A5]">Remboursement</p>
                    <p className="text-[#565556]">
                      {selectedOffer.conditions.refund_before_departure?.allowed ? 'Autorisé' : 'Non autorisé'}
                    </p>
                    {selectedOffer.conditions.refund_before_departure?.penalty_amount && (
                      <p className="text-xs text-[#A5A6A5]">Pénalité: {selectedOffer.conditions.refund_before_departure.penalty_amount} {selectedOffer.conditions.refund_before_departure.penalty_currency}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-[#A5A6A5]">Modification</p>
                    <p className="text-[#565556]">
                      {selectedOffer.conditions.change_before_departure?.allowed ? 'Autorisée' : 'Non autorisée'}
                    </p>
                    {selectedOffer.conditions.change_before_departure?.penalty_amount && (
                      <p className="text-xs text-[#A5A6A5]">Pénalité: {selectedOffer.conditions.change_before_departure.penalty_amount} {selectedOffer.conditions.change_before_departure.penalty_currency}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment info */}
              <div className="mb-6 p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                <h4 className="text-sm font-semibold text-[#565556] mb-3">Paiement</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-[#A5A6A5]">Paiement instantané requis</p>
                    <p className="text-[#565556]">
                      {selectedOffer.payment_requirements.requires_instant_payment ? 'Oui' : 'Non'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#A5A6A5]">Paiement requis avant</p>
                    <p className="text-[#565556]">{formatDateTime(selectedOffer.payment_requirements.payment_required_by)}</p>
                  </div>
                </div>
                {selectedOffer.payment_requirements.price_guarantee_expires_at && (
                  <div className="mt-2 text-xs text-[#A5A6A5]">
                    Garantie prix expire: {formatDateTime(selectedOffer.payment_requirements.price_guarantee_expires_at)}
                  </div>
                )}
              </div>

              {/* Additional info */}
              <div className="mb-6 p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                <h4 className="text-sm font-semibold text-[#565556] mb-3">Informations additionnelles</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-[#A5A6A5]">Documents requis</p>
                    <p className="text-[#565556]">
                      {selectedOffer.passenger_identity_documents_required ? 'Oui' : 'Non'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#A5A6A5]">Types de documents supportés</p>
                    <p className="text-[#565556]">
                      {selectedOffer.supported_passenger_identity_document_types?.join(', ') || 'N/A'}
                    </p>
                  </div>
                </div>
                {selectedOffer.supported_loyalty_programmes && selectedOffer.supported_loyalty_programmes.length > 0 && (
                  <div className="mt-2 text-xs text-[#A5A6A5]">
                    Programmes fidélité: {selectedOffer.supported_loyalty_programmes.join(', ')}
                  </div>
                )}
              </div>

              {/* Emissions */}
              <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                <h4 className="text-sm font-semibold text-green-700 mb-2">Émissions CO₂</h4>
                <p className="text-2xl font-bold text-green-700">{parseFloat(selectedOffer.total_emissions_kg).toLocaleString()} kg</p>
              </div>

              {/* Dates */}
              <div className="mt-6 pt-4 border-t border-[#e5e5e5] text-xs text-[#A5A6A5]">
                <p>Créé le: {formatDateTime(selectedOffer.created_at)}</p>
                <p>Mis à jour le: {formatDateTime(selectedOffer.updated_at)}</p>
                <p>Expire le: {formatDateTime(selectedOffer.expires_at)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de réservation */}
      {showBookingModal && selectedOffer && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-8">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-[#A11B1B] to-[#8a1616] px-8 py-6 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Ticket className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Réserver le vol</h3>
                  <p className="text-white/80 text-sm">Offre {selectedOffer.id.slice(-8)}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  setBookingError('');
                  setBookingSuccess(null);
                }}
                className="p-2 rounded-lg hover:bg-white/20 text-white transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8">
              {bookingSuccess ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-500" />
                  <h4 className="text-xl font-bold text-[#565556] mb-2">Réservation réussie !</h4>
                  <p className="text-[#A5A6A5] mb-4">Votre vol a été réservé avec succès.</p>
                  <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5] text-left">
                    <p className="text-sm text-[#A5A6A5]">Référence de réservation</p>
                    <p className="text-lg font-bold text-[#A11B1B]">{bookingSuccess.booking_reference}</p>
                    <p className="text-sm text-[#A5A6A5] mt-2">ID de commande</p>
                    <p className="text-sm text-[#565556]">{bookingSuccess.id}</p>
                    <p className="text-sm text-[#A5A6A5] mt-2">Montant total</p>
                    <p className="text-lg font-bold text-[#565556]">{parseFloat(bookingSuccess.total_amount).toLocaleString()} {bookingSuccess.currency}</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-[#A11B1B]/5 to-[#8a1616]/5 border border-[#A11B1B]/20">
                    <div>
                      <p className="text-xs text-[#A5A6A5]">Total à payer</p>
                      <p className="text-2xl font-bold text-[#A11B1B]">{parseFloat(selectedOffer.total_amount).toLocaleString()} {selectedOffer.total_currency}</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <h4 className="text-sm font-semibold text-[#565556]">Informations de réservation</h4>
                    <div className="flex flex-col gap-1">
                      <p className="text-xs text-[#A5A6A5]">Matricule: <span className="font-medium text-[#565556]">{currentMatricule}</span></p>
                      <p className="text-xs text-[#A5A6A5]">Les informations du passager seront récupérées automatiquement depuis le profil utilisateur</p>
                    </div>
                  </div>

                  {bookingError && (
                    <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                      {bookingError}
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-4 border-t border-[#e5e5e5]">
                    <button
                      onClick={() => {
                        setShowBookingModal(false);
                        setBookingError('');
                      }}
                      className="px-5 py-2.5 rounded-lg text-sm font-medium text-[#565556] hover:bg-[#f4f4f4] transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={async () => {
                        if (!currentMatricule) {
                          setBookingError('Matricule non disponible. Veuillez réessayer depuis la liste des billets.');
                          return;
                        }

                        setBookingLoading(true);
                        setBookingError('');

                        try {
                          const request: BookingRequest = {
                            selected_offers: [selectedOffer.id],
                            matricule: currentMatricule,
                            passenger_id: selectedOffer.passengers[0]?.id || 'passenger_1',
                          };

                          console.log('Données envoyées à l\'API de réservation:', request);

                          const result = await bookFlight(request);
                          console.log('Réponse de l\'API de réservation:', result);
                          setBookingSuccess(result);

                          // Close all modals and refresh data
                          setTimeout(() => {
                            setShowBookingModal(false);
                            setSelectedOffer(null);
                            setBookingSuccess(null);
                            load();
                          }, 2000);
                        } catch (error) {
                          const msg = (error as Error).message || 'Erreur lors de la réservation';
                          setBookingError(msg);
                        } finally {
                          setBookingLoading(false);
                        }
                      }}
                      disabled={bookingLoading}
                      className="px-5 py-2.5 rounded-lg bg-[#A11B1B] text-white text-sm font-medium hover:bg-[#8a1616] transition-colors disabled:opacity-60 flex items-center gap-2"
                    >
                      {bookingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      {bookingLoading ? 'Réservation en cours...' : 'Confirmer la réservation'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
