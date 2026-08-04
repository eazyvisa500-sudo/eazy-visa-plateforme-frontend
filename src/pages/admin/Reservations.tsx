import { useEffect, useState } from 'react';
import {
  Plane, Hotel, Loader2, Eye, Calendar, MapPin, ArrowRight,
  CheckCircle2, Ban, RefreshCw, User, Building2, Ticket,
  Search, Filter, X, CheckSquare, Square, Download,
} from 'lucide-react';
import {
  getReservationsEntreprise,
  filterReservations,
  checkBudgets,
  downloadTicketPdf,
  type ReservationBillet,
  type ReservationHotel,
  type FilterReservationsRequest,
  type FilterReservationsResponse,
  type CheckBudgetsRequest,
  type CheckBudgetsResponse,
} from '../../services/reservations';
import {
  searchAdvancedFlights,
  type SearchAdvancedRequest,
  type SearchAdvancedResponse,
} from '../../services/flights';
import {
  bookGroupFlight,
  checkCancellation,
  confirmCancellation,
  formatDuration,
  formatDateTime,
  type BookGroupRequest,
  type BookGroupResponse,
  type CancellationCheckRequest,
  type CancellationCheckResponse,
  type CancellationConfirmRequest,
} from '../../services/flights';
import { getEmployes, type Employe } from '../../services/employes';
import { getErrorMessage } from '../../lib/api-errors';
import { ErrorAlert } from '../../components/ErrorAlert';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../../components/Modal';
import { BilletFlightSearchModal } from '../../components/modals/BilletFlightSearchModal';
import { FlightSearchModal } from '../../components/modals/FlightSearchModal';

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
  const [downloadingTicketId, setDownloadingTicketId] = useState<number | null>(null);

  const [showBilletDetail, setShowBilletDetail] = useState(false);
  const [showHotelDetail, setShowHotelDetail] = useState(false);
  const [showFlightSearch, setShowFlightSearch] = useState(false);
  const [flightSearchKey, setFlightSearchKey] = useState(0);
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [showBilletFlightSearch, setShowBilletFlightSearch] = useState(false);
  const [billetFlightSearchKey, setBilletFlightSearchKey] = useState(0);
  const [billetFlightSearchInitials, setBilletFlightSearchInitials] = useState({
    origin: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    cabinClass: 'economy',
  });
  const [selBillet, setSelBillet] = useState<ReservationBillet | null>(null);
  const [selHotel, setSelHotel] = useState<ReservationHotel | null>(null);

  // Context for billet flight booking
  const [currentMatricule, setCurrentMatricule] = useState('');
  const [currentDemandeVoyageId, setCurrentDemandeVoyageId] = useState<number | null>(null);

  // Cancellation states
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [cancellationLoading, setCancellationLoading] = useState(false);
  const [cancellationError, setCancellationError] = useState('');
  const [cancellationQuote, setCancellationQuote] = useState<CancellationCheckResponse['data'] | null>(null);
  const [confirmingCancellation, setConfirmingCancellation] = useState(false);
  const [cancellationSuccess, setCancellationSuccess] = useState<CancellationCheckResponse['data'] | null>(null);

  // Group filter states
  const [showGroupFilterModal, setShowGroupFilterModal] = useState(false);
  const [groupFilterLoading, setGroupFilterLoading] = useState(false);
  const [groupFilterError, setGroupFilterError] = useState('');
  const [groupFilterResults, setGroupFilterResults] = useState<FilterReservationsResponse | null>(null);
  const [filterDate, setFilterDate] = useState('');
  const [filterDateRetour, setFilterDateRetour] = useState('');
  const [filterAeroportDepart, setFilterAeroportDepart] = useState('');
  const [filterAeroportArrivee, setFilterAeroportArrivee] = useState('');
  const [filterClasse, setFilterClasse] = useState('');
  const [selectedBillets, setSelectedBillets] = useState<number[]>([]);
  const [flightSearchLoading, setFlightSearchLoading] = useState(false);
  const [flightSearchError, setFlightSearchError] = useState('');
  const [flightSearchResults, setFlightSearchResults] = useState<SearchAdvancedResponse | null>(null);
  const [selectedFlightOffer, setSelectedFlightOffer] = useState<string | null>(null);
  const [workflowStep, setWorkflowStep] = useState<'filter' | 'flights' | 'validation'>('filter');
  const [budgetCheckLoading, setBudgetCheckLoading] = useState(false);
  const [budgetCheckError, setBudgetCheckError] = useState('');
  const [budgetCheckResult, setBudgetCheckResult] = useState<CheckBudgetsResponse | null>(null);
  const [groupBookingSuccess, setGroupBookingSuccess] = useState<BookGroupResponse | null>(null);
  const [showGroupBookingSuccessModal, setShowGroupBookingSuccessModal] = useState(false);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Filter functions
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

  async function load() {
    setLoading(true); setError('');
    try {
      const res = await getReservationsEntreprise();
      setBillets(res.billets.data);
      setHotels(res.hotels.data);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  // Chargement de la liste des employés pour l'assignation passager/employé
  useEffect(() => {
    getEmployes()
      .then((res) => setEmployes(res.employes))
      .catch(() => setEmployes([]));
  }, []);

  function openFlightSearch(billet: ReservationBillet) {
    console.log('Données du billet pour recherche de vol:', billet);

    // Store matricule and demandeVoyageId from demandeVoyage
    setCurrentMatricule(billet.demandeVoyage.matricule);
    setCurrentDemandeVoyageId(billet.demandeVoyageId);

    // Map classe to cabin class
    const classMap: Record<string, string> = { Y: 'economy', W: 'premium_economy', J: 'business', F: 'first' };

    // Pre-fill search form for the dedicated billet modal
    setBilletFlightSearchInitials({
      origin: billet.aeroportDepart,
      destination: billet.aeroportArrivee,
      departureDate: billet.dateVolDepart.slice(0, 10),
      returnDate: billet.allerRetour && billet.dateVolRetourDepart ? billet.dateVolRetourDepart.slice(0, 10) : '',
      cabinClass: classMap[billet.classe] || 'economy',
    });

    setBilletFlightSearchKey((prev) => prev + 1);
    setShowBilletFlightSearch(true);
  }

  async function handleGroupFilter() {
    setGroupFilterLoading(true);
    setGroupFilterError('');
    setGroupFilterResults(null);

    try {
      // Validate required fields
      if (!filterDate) {
        setGroupFilterError('La date de départ est requise');
        setGroupFilterLoading(false);
        return;
      }
      if (!filterAeroportDepart) {
        setGroupFilterError('L\'aéroport de départ est requis');
        setGroupFilterLoading(false);
        return;
      }
      if (!filterAeroportArrivee) {
        setGroupFilterError('L\'aéroport d\'arrivée est requis');
        setGroupFilterLoading(false);
        return;
      }
      if (!filterClasse) {
        setGroupFilterError('La classe de vol est requise');
        setGroupFilterLoading(false);
        return;
      }

      const request: FilterReservationsRequest = {
        date: filterDate,
        aeroportDepart: filterAeroportDepart,
        aeroportArrivee: filterAeroportArrivee,
        classe: filterClasse,
      };
      if (filterDateRetour) request.dateRetour = filterDateRetour;

      console.log('Données envoyées à l\'API de filtre de réservations:', request);

      const results = await filterReservations(request);
      console.log('Réponse de l\'API de filtre de réservations:', results);
      setGroupFilterResults(results);
    } catch (error) {
      setGroupFilterError(getErrorMessage(error));
    } finally {
      setGroupFilterLoading(false);
    }
  }

  function resetGroupFilter() {
    setFilterDate('');
    setFilterDateRetour('');
    setFilterAeroportDepart('');
    setFilterAeroportArrivee('');
    setFilterClasse('');
    setGroupFilterError('');
    setGroupFilterResults(null);
    setSelectedBillets([]);
    setFlightSearchResults(null);
    setSelectedFlightOffer(null);
    setWorkflowStep('filter');
  }

  function toggleBilletSelection(billetId: number) {
    setSelectedBillets(prev =>
      prev.includes(billetId)
        ? prev.filter(id => id !== billetId)
        : [...prev, billetId]
    );
  }

  function toggleSelectAll() {
    if (groupFilterResults && groupFilterResults.data) {
      const allIds = groupFilterResults.data.map(b => b.id);
      setSelectedBillets(
        selectedBillets.length === allIds.length && allIds.every(id => selectedBillets.includes(id))
          ? []
          : allIds
      );
    }
  }

  async function handleSearchFlights() {
    if (!groupFilterResults || selectedBillets.length === 0) return;

    setFlightSearchLoading(true);
    setFlightSearchError('');
    setFlightSearchResults(null);

    try {
      // Map filter classe to API format
      const classeMap: Record<string, 'economy' | 'premium_economy' | 'business' | 'first'> = {
        'Y': 'economy',
        'W': 'premium_economy',
        'C': 'business',
        'F': 'first',
      };

      const request: SearchAdvancedRequest = {
        dateDepart: groupFilterResults.filters.date || '',
        dateRetour: groupFilterResults.filters.dateRetour,
        aeroportDepart: groupFilterResults.filters.aeroportDepart || '',
        aeroportArrivee: groupFilterResults.filters.aeroportArrivee || '',
        classe: classeMap[groupFilterResults.filters.classe || 'Y'] || 'economy',
        nombrePassenger: selectedBillets.length,
      };

      console.log('Recherche de vols avec:', request);

      const results = await searchAdvancedFlights(request);
      console.log('Résultats de recherche de vols:', results);
      setFlightSearchResults(results);
      setWorkflowStep('flights');
    } catch (error) {
      setFlightSearchError(getErrorMessage(error));
    } finally {
      setFlightSearchLoading(false);
    }
  }

  function handleSelectFlight(offerId: string) {
    setSelectedFlightOffer(offerId);
  }

  async function handleValidateFlight() {
    if (!selectedFlightOffer || !groupFilterResults) return;

    // Get matricules from selected billets
    const selectedBilletsData = groupFilterResults.data.filter(b => selectedBillets.includes(b.id));
    const matricules = selectedBilletsData.map(b => b.demandeVoyage.user?.matricule).filter((m): m is string => !!m);

    if (matricules.length === 0) {
      setBudgetCheckError('Aucun matricule trouvé pour les billets sélectionnés');
      return;
    }

    // Get the selected flight offer
    const selectedOffer = flightSearchResults?.offers.find(o => o.id === selectedFlightOffer);
    if (!selectedOffer) {
      setBudgetCheckError('Offre de vol introuvable');
      return;
    }

    setBudgetCheckLoading(true);
    setBudgetCheckError('');
    setBudgetCheckResult(null);

    try {
      const request: CheckBudgetsRequest = {
        matricules,
        somme: parseFloat(selectedOffer.total_amount),
        devise: selectedOffer.total_currency,
      };

      console.log('Vérification des budgets:', request);

      const result = await checkBudgets(request);
      console.log('Résultat de vérification des budgets:', result);
      setBudgetCheckResult(result);

      if (result.ok) {
        setWorkflowStep('validation');
      }
    } catch (error) {
      setBudgetCheckError(getErrorMessage(error));
    } finally {
      setBudgetCheckLoading(false);
    }
  }

  function handleBackToFlights() {
    setWorkflowStep('flights');
    setBudgetCheckError('');
    setBudgetCheckResult(null);
  }

  function handleBackToFilter() {
    setWorkflowStep('filter');
    setBudgetCheckError('');
    setBudgetCheckResult(null);
  }

  async function handleBookGroupFlight() {
    if (!selectedFlightOffer || !groupFilterResults || selectedBillets.length === 0) return;

    setBudgetCheckLoading(true);
    setBudgetCheckError('');

    try {
      // Get selected billets data
      const selectedBilletsData = groupFilterResults.data.filter(b => selectedBillets.includes(b.id));
      const matricules = selectedBilletsData.map(b => b.demandeVoyage.user?.matricule).filter((m): m is string => !!m);
      const demandeVoyageIds = selectedBilletsData.map(b => b.demandeVoyageId);

      if (matricules.length === 0) {
        setBudgetCheckError('Aucun matricule trouvé pour les billets sélectionnés');
        return;
      }

      if (matricules.length !== demandeVoyageIds.length) {
        setBudgetCheckError('Erreur de correspondance entre les matricules et les demandes de voyage');
        return;
      }

      // Get the selected flight offer
      const selectedOffer = flightSearchResults?.offers.find(o => o.id === selectedFlightOffer);
      if (!selectedOffer) {
        setBudgetCheckError('Offre de vol introuvable');
        return;
      }

      // Extract passenger IDs from the flight offer response
      const passenger_ids = selectedOffer.passengers.map(p => p.id);

      if (passenger_ids.length !== matricules.length) {
        setBudgetCheckError(`Nombre de passagers incohérent: ${passenger_ids.length} dans l'offre, ${matricules.length} sélectionnés`);
        return;
      }

      const request: BookGroupRequest = {
        selected_offers: [selectedFlightOffer],
        matricules,
        passenger_ids,
        demandeVoyageIds,
      };

      console.log('Réservation groupée avec:', request);

      const result = await bookGroupFlight(request);
      console.log('Résultat de la réservation groupée:', result);

      // Show success modal
      setGroupBookingSuccess(result);
      setShowGroupBookingSuccessModal(true);
      setShowGroupFilterModal(false);
      resetGroupFilter();
      load();
    } catch (error) {
      setBudgetCheckError(getErrorMessage(error));
    } finally {
      setBudgetCheckLoading(false);
    }
  }

  async function handleCheckCancellation(orderId: string) {
    setCancellationLoading(true);
    setCancellationError('');
    setCancellationQuote(null);
    setCancellationSuccess(null);

    try {
      const request: CancellationCheckRequest = { orderId };
      const response = await checkCancellation(request);
      setCancellationQuote(response.data);
    } catch (error) {
      setCancellationError(getErrorMessage(error));
    } finally {
      setCancellationLoading(false);
      setShowCancellationModal(true);
    }
  }

  async function handleConfirmCancellation(orderId: string) {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler ce billet ? Cette action est irréversible.')) {
      return;
    }

    setConfirmingCancellation(true);
    setCancellationError('');

    try {
      const request: CancellationConfirmRequest = { orderId };
      const response = await confirmCancellation(request);
      setCancellationSuccess(response.data);
      setCancellationQuote(null);
      // Refresh the reservations list
      await load();
    } catch (error) {
      setCancellationError(getErrorMessage(error));
    } finally {
      setConfirmingCancellation(false);
    }
  }

  async function handleDownloadTicket(billet: ReservationBillet) {
    setDownloadingTicketId(billet.id);
    try {
      await downloadTicketPdf(billet.id, billet.numeroReservation);
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setDownloadingTicketId(null);
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
              className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] placeholder:text-[#A5A6A5] focus:outline-none focus:ring-2 focus:ring-[#A11B1B]/20 focus:border-[#A11B1B]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A5A6A5] hover:text-[#565556]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowGroupFilterModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#A11B1B] text-white text-sm font-medium hover:bg-[#8a1616] transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Réservation groupe</span>
          </button>
          <button
            onClick={() => { setFlightSearchKey((k) => k + 1); setShowFlightSearch(true); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#A11B1B] text-white text-sm font-medium hover:bg-[#8a1616] transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>Rechercher vol</span>
          </button>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] focus:outline-none focus:ring-2 focus:ring-[#A11B1B]/20 focus:border-[#A11B1B]"
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
        <div className="flex items-center justify-center gap-2 py-12 text-[#A5A6A5]">
          <Loader2 className="w-5 h-5 animate-spin" /><span>Chargement…</span>
        </div>
      ) : (
        <>
          {/* Billets */}
          <div className="rounded-xl border border-[#e5e5e5] bg-white overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#e5e5e5] bg-[#fafafa]">
              <Plane className="w-4 h-4 text-[#A11B1B]" />
              <h2 className="text-sm font-semibold text-[#565556]">Billets ({filteredBillets.length})</h2>
            </div>
            {filteredBillets.length === 0 ? (
              <div className="px-4 py-8 text-center text-[#A5A6A5]">
                <Plane className="w-10 h-10 mx-auto mb-3 text-[#e5e5e5]" />
                <p className="text-sm">{searchQuery || filterStatus !== 'all' ? 'Aucun résultat trouvé' : 'Aucun billet réservé'}</p>
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
                    {filteredBillets.map((b) => (
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
                            {b.statut === 'EN_ATTENTE' && (
                              <button onClick={() => { openFlightSearch(b); }} className="p-1.5 rounded-md hover:bg-[#f4f4f4] text-[#565556]" title="Rechercher vol"><Ticket className="w-4 h-4" /></button>
                            )}
                            <button onClick={() => { console.log('Données du billet:', b); setSelBillet(b); setShowBilletDetail(true); }} className="p-1.5 rounded-md hover:bg-[#f4f4f4] text-[#565556]" title="Détail"><Eye className="w-4 h-4" /></button>
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
              <h2 className="text-sm font-semibold text-[#565556]">Hôtels ({filteredHotels.length})</h2>
            </div>
            {filteredHotels.length === 0 ? (
              <div className="px-4 py-8 text-center text-[#A5A6A5]">
                <Hotel className="w-10 h-10 mx-auto mb-3 text-[#e5e5e5]" />
                <p className="text-sm">{searchQuery || filterStatus !== 'all' ? 'Aucun résultat trouvé' : 'Aucun hôtel réservé'}</p>
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
                    {filteredHotels.map((h) => (
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
          >
            {selBillet.statut === 'EMISE' && selBillet.numeroOrder && (
              <button
                onClick={() => {
                  if (!selBillet.numeroOrder) return;
                  handleCheckCancellation(selBillet.numeroOrder);
                }}
                disabled={cancellationLoading}
                className="px-4 py-2 rounded-lg bg-white/20 text-white text-sm font-medium hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {cancellationLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
                {cancellationLoading ? 'Vérification...' : 'Annuler le billet'}
              </button>
            )}
          </ModalHeader>
          <ModalBody className="p-8 space-y-6">
            {/* Section Employé & Entreprise */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5] flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#A11B1B]/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-[#A11B1B]" />
                </div>
                <div>
                  <p className="text-xs text-[#A5A6A5]">Employé</p>
                  <p className="text-sm font-medium text-[#565556]">{selBillet.demandeVoyage.user?.prenom} {selBillet.demandeVoyage.user?.nom}</p>
                  <p className="text-xs text-[#A5A6A5]">{selBillet.demandeVoyage.user?.matricule}</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5] flex items-center gap-3">
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
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleDownloadTicket(selBillet)}
                disabled={downloadingTicketId === selBillet.id}
                className="px-5 py-2.5 rounded-lg text-sm font-medium border border-[#A11B1B] text-[#A11B1B] hover:bg-[#A11B1B]/5 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {downloadingTicketId === selBillet.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Télécharger le billet
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowBilletDetail(false);
                  setSelBillet(null);
                }}
                className="px-5 py-2.5 rounded-lg text-sm font-medium bg-[#A11B1B] text-white hover:bg-[#8a1616] transition-colors"
              >
                Fermer
              </button>
            </div>
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
            {/* Section Employé & Entreprise */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5] flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#A11B1B]/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-[#A11B1B]" />
                </div>
                <div>
                  <p className="text-xs text-[#A5A6A5]">Employé</p>
                  <p className="text-sm font-medium text-[#565556]">{selHotel.demandeVoyage.user?.prenom} {selHotel.demandeVoyage.user?.nom}</p>
                  <p className="text-xs text-[#A5A6A5]">{selHotel.demandeVoyage.user?.matricule}</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5] flex items-center gap-3">
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

      {/* Modal recherche de vol */}
      <FlightSearchModal
        key={`flight-search-${flightSearchKey}`}
        isOpen={showFlightSearch}
        onClose={() => setShowFlightSearch(false)}
        employees={employes.map((e) => ({ matricule: e.matricule, prenom: e.prenom, nom: e.nom }))}
      />
      {/* Modal recherche de vol - icône billet */}
      <BilletFlightSearchModal
        key={`billet-flight-search-${billetFlightSearchKey}`}
        isOpen={showBilletFlightSearch}
        onClose={() => setShowBilletFlightSearch(false)}
        initialOrigin={billetFlightSearchInitials.origin}
        initialDestination={billetFlightSearchInitials.destination}
        initialDepartureDate={billetFlightSearchInitials.departureDate}
        initialReturnDate={billetFlightSearchInitials.returnDate}
        initialCabinClass={billetFlightSearchInitials.cabinClass}
        matricule={currentMatricule}
        demandeVoyageId={currentDemandeVoyageId}
        onBookingSuccess={() => {
          load();
          setCurrentMatricule('');
          setCurrentDemandeVoyageId(null);
        }}
      />

      {/* Modal d'annulation */}
      {showCancellationModal && (
        <Modal
          isOpen={showCancellationModal}
          onClose={() => {
            setShowCancellationModal(false);
            setCancellationError('');
            setCancellationQuote(null);
          }}
          size="xl"
        >
          <ModalHeader
            title="Conditions d'annulation"
            subtitle={cancellationQuote ? `Quote ID: ${cancellationQuote.id}` : 'Résultat de la vérification'}
            icon={<Ban className="w-5 h-5 text-white" />}
            variant="brand"
          />
          <ModalBody className="p-8 space-y-6">
            {cancellationLoading && (
              <div className="flex items-center justify-center gap-2 py-8 text-[#A5A6A5]">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Vérification en cours...</span>
              </div>
            )}

            {!cancellationLoading && cancellationError && (
              <div className="space-y-4">
                <ErrorAlert error={cancellationError} onDismiss={() => setCancellationError('')} />
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <p className="text-sm text-amber-700">
                    La commande ne peut pas être annulée. Veuillez vérifier les conditions ou contacter le support.
                  </p>
                </div>
              </div>
            )}

            {!cancellationLoading && cancellationQuote && (
              <>
                <div className="p-5 rounded-xl bg-gradient-to-r from-[#A11B1B]/5 to-[#8a1616]/5 border border-[#A11B1B]/20">
                  <h4 className="text-sm font-semibold text-[#565556] mb-4">Informations de remboursement</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-[#A5A6A5]">Montant remboursé</p>
                      <p className="text-2xl font-bold text-[#A11B1B]">{parseFloat(cancellationQuote.refund_amount).toLocaleString()} {cancellationQuote.refund_currency}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#A5A6A5]">Type de remboursement</p>
                      <p className="text-lg font-semibold text-[#565556]">{cancellationQuote.refund_to === 'balance' ? 'Solde' : cancellationQuote.refund_to}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                    <p className="text-xs text-[#A5A6A5] mb-2">ID de commande</p>
                    <p className="text-sm font-mono text-[#565556]">{cancellationQuote.order_id}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                    <p className="text-xs text-[#A5A6A5] mb-2">Mode</p>
                    <p className="text-sm text-[#565556]">{cancellationQuote.live_mode ? 'Live' : 'Test'}</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                  <p className="text-xs text-[#A5A6A5] mb-2">Date d'expiration du quote</p>
                  <p className="text-sm text-[#565556]">{fmtDateTime(cancellationQuote.expires_at)}</p>
                </div>

                {cancellationQuote.airline_credits && cancellationQuote.airline_credits.length > 0 && (
                  <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                    <p className="text-xs text-[#A5A6A5] mb-2">Crédits aérien</p>
                    <div className="space-y-2">
                      {cancellationQuote.airline_credits.map((credit: any, index: number) => (
                        <div key={index} className="text-sm text-[#565556]">
                          {JSON.stringify(credit)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-[#e5e5e5]">
                  <button
                    onClick={() => {
                      setShowCancellationModal(false);
                      setCancellationError('');
                      setCancellationQuote(null);
                    }}
                    className="px-5 py-2.5 rounded-lg text-sm font-medium text-[#565556] hover:bg-[#f4f4f4] transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => handleConfirmCancellation(cancellationQuote.order_id)}
                    disabled={confirmingCancellation}
                    className="px-5 py-2.5 rounded-lg text-sm font-medium bg-[#A11B1B] text-white hover:bg-[#8a1616] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {confirmingCancellation ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    {confirmingCancellation ? 'Annulation en cours...' : 'Confirmer l\'annulation'}
                  </button>
                </div>
              </>
            )}

            {!cancellationLoading && cancellationSuccess && (
              <div className="space-y-4">
                <div className="p-5 rounded-xl bg-green-50 border border-green-200">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                    <div>
                      <h4 className="text-lg font-semibold text-green-800">Annulation réussie</h4>
                      <p className="text-sm text-green-700">Le billet a été annulé avec succès.</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-gradient-to-r from-[#A11B1B]/5 to-[#8a1616]/5 border border-[#A11B1B]/20">
                  <h4 className="text-sm font-semibold text-[#565556] mb-4">Informations de remboursement</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-[#A5A6A5]">Montant remboursé</p>
                      <p className="text-2xl font-bold text-[#A11B1B]">{parseFloat(cancellationSuccess.refund_amount).toLocaleString()} {cancellationSuccess.refund_currency}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#A5A6A5]">Type de remboursement</p>
                      <p className="text-lg font-semibold text-[#565556]">{cancellationSuccess.refund_to === 'balance' ? 'Solde' : cancellationSuccess.refund_to}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                  <p className="text-xs text-[#A5A6A5] mb-2">Date de confirmation</p>
                  <p className="text-sm text-[#565556]">{cancellationSuccess.confirmed_at ? fmtDateTime(cancellationSuccess.confirmed_at) : 'Non confirmé'}</p>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#e5e5e5]">
                  <button
                    onClick={() => {
                      setShowCancellationModal(false);
                      setCancellationError('');
                      setCancellationQuote(null);
                      setCancellationSuccess(null);
                    }}
                    className="px-5 py-2.5 rounded-lg text-sm font-medium text-[#565556] hover:bg-[#f4f4f4] transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            )}
          </ModalBody>
        </Modal>
      )}

      {/* Group Filter Modal */}
      {showGroupFilterModal && (
        <Modal
          isOpen={showGroupFilterModal}
          onClose={() => {
            setShowGroupFilterModal(false);
            resetGroupFilter();
          }}
          size="2xl"
          closeOnOverlay={false}
        >
          <ModalHeader
            title="Filtrer les réservations"
            subtitle="Recherche avancée par statut, date et aéroports"
            icon={<Filter className="w-5 h-5 text-[#A11B1B]" />}
            variant="neutral"
          />

          {/* Fixed Error Messages */}
          <div className="px-6 py-4 border-b border-[#e5e5e5] bg-white flex-shrink-0">
              {groupFilterError && <ErrorAlert error={groupFilterError} onDismiss={() => setGroupFilterError('')} />}
              {budgetCheckError && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm text-red-600">{budgetCheckError}</p>
                </div>
              )}
              {budgetCheckResult && !budgetCheckResult.ok && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm font-medium text-red-600 mb-2">{budgetCheckResult.message}</p>
                  <p className="text-xs text-red-600 mb-3">
                    Montant par personne: {budgetCheckResult.montantParPersonne.toLocaleString()} XOF
                  </p>
                  {budgetCheckResult.usersInsuffisants && budgetCheckResult.usersInsuffisants.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-red-600">Utilisateurs avec budget insuffisant:</p>
                      {budgetCheckResult.usersInsuffisants.map((user) => (
                        <div key={user.user.matricule} className="text-xs text-red-600 bg-white p-2 rounded">
                          <p>{user.user.prenom} {user.user.nom} ({user.user.matricule})</p>
                          <p>Budget restant: {user.montantRestant.toLocaleString()} XOF</p>
                          <p>Montant requis: {user.montantRequis.toLocaleString()} XOF</p>
                          <p>Manque: {user.difference.toLocaleString()} XOF</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <ModalBody>

              {/* Step 1: Filter and Selection */}
              {workflowStep === 'filter' && !groupFilterResults && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-[#565556] mb-2">Date de vol (départ)</label>
                      <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] focus:outline-none focus:ring-2 focus:ring-[#A11B1B]/20 focus:border-[#A11B1B]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#565556] mb-2">Date de vol (retour)</label>
                      <input
                        type="date"
                        value={filterDateRetour}
                        onChange={(e) => setFilterDateRetour(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] focus:outline-none focus:ring-2 focus:ring-[#A11B1B]/20 focus:border-[#A11B1B]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#565556] mb-2">Aéroport de départ</label>
                      <input
                        type="text"
                        placeholder="Ex: DSS"
                        value={filterAeroportDepart}
                        onChange={(e) => setFilterAeroportDepart(e.target.value.toUpperCase())}
                        className="w-full px-4 py-2.5 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] focus:outline-none focus:ring-2 focus:ring-[#A11B1B]/20 focus:border-[#A11B1B]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#565556] mb-2">Aéroport d'arrivée</label>
                      <input
                        type="text"
                        placeholder="Ex: CDG"
                        value={filterAeroportArrivee}
                        onChange={(e) => setFilterAeroportArrivee(e.target.value.toUpperCase())}
                        className="w-full px-4 py-2.5 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] focus:outline-none focus:ring-2 focus:ring-[#A11B1B]/20 focus:border-[#A11B1B]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#565556] mb-2">Classe de vol</label>
                      <select
                        value={filterClasse}
                        onChange={(e) => setFilterClasse(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-[#e5e5e5] text-sm text-[#565556] focus:outline-none focus:ring-2 focus:ring-[#A11B1B]/20 focus:border-[#A11B1B]"
                      >
                        <option value="">Toutes les classes</option>
                        <option value="Y">Économique (Y)</option>
                        <option value="W">Premium Économique (W)</option>
                        <option value="C">Business (C)</option>
                        <option value="F">Première (F)</option>
                      </select>
                    </div>
                  </div>

                </div>
              )}

              {/* Step 1: Filter Results and Selection */}
              {workflowStep === 'filter' && groupFilterResults && (
                <div className="space-y-6">
                  <div className="p-4 rounded-xl bg-gradient-to-r from-[#A11B1B]/5 to-[#8a1616]/5 border border-[#A11B1B]/20">
                    <h4 className="text-sm font-semibold text-[#565556] mb-3">Filtres appliqués</h4>
                    <div className="flex flex-wrap gap-2">
                      {groupFilterResults.filters.date && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-[#A11B1B]/20 text-sm text-[#565556]">
                          Date départ: {groupFilterResults.filters.date}
                        </span>
                      )}
                      {groupFilterResults.filters.dateRetour && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-[#A11B1B]/20 text-sm text-[#565556]">
                          Date retour: {groupFilterResults.filters.dateRetour}
                        </span>
                      )}
                      {groupFilterResults.filters.aeroportDepart && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-[#A11B1B]/20 text-sm text-[#565556]">
                          Départ: {groupFilterResults.filters.aeroportDepart}
                        </span>
                      )}
                      {groupFilterResults.filters.aeroportArrivee && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-[#A11B1B]/20 text-sm text-[#565556]">
                          Arrivée: {groupFilterResults.filters.aeroportArrivee}
                        </span>
                      )}
                      {groupFilterResults.filters.classe && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-[#A11B1B]/20 text-sm text-[#565556]">
                          Classe: {groupFilterResults.filters.classe}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Billets Results */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-[#565556] flex items-center gap-2">
                        <Plane className="w-5 h-5 text-[#A11B1B]" />
                        Billets ({groupFilterResults.total})
                      </h4>
                      {groupFilterResults.data && groupFilterResults.data.length > 0 && (
                        <div className="flex items-center gap-4">
                          <button
                            onClick={toggleSelectAll}
                            className="text-sm text-[#A11B1B] hover:underline"
                          >
                            {selectedBillets.length === groupFilterResults.data.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                          </button>
                          <span className="text-sm text-[#A5A6A5]">
                            {selectedBillets.length} sélectionné(s)
                          </span>
                        </div>
                      )}
                    </div>
                    {!groupFilterResults.data || groupFilterResults.data.length === 0 ? (
                      <p className="text-sm text-[#A5A6A5]">Aucun billet trouvé</p>
                    ) : (
                      <div className="space-y-3">
                        {groupFilterResults.data.map((billet) => (
                          <div
                            key={billet.id}
                            className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                              selectedBillets.includes(billet.id)
                                ? 'bg-[#A11B1B]/5 border-[#A11B1B]'
                                : 'bg-[#fafafa] border-[#e5e5e5] hover:border-[#A11B1B]/50'
                            }`}
                            onClick={() => toggleBilletSelection(billet.id)}
                          >
                            <div className="flex items-start gap-3">
                              <div className="pt-1">
                                {selectedBillets.includes(billet.id) ? (
                                  <CheckSquare className="w-5 h-5 text-[#A11B1B]" />
                                ) : (
                                  <Square className="w-5 h-5 text-[#A5A6A5]" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <p className="font-semibold text-[#565556]">{billet.demandeVoyage.user?.nom} {billet.demandeVoyage.user?.prenom}</p>
                                    <p className="text-sm text-[#A5A6A5]">Matricule: {billet.demandeVoyage.user?.matricule}</p>
                                  </div>
                                  {statutBadge(billet.statut)}
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="text-xs text-[#A5A6A5]">Vol</p>
                                    <p className="text-[#565556]">{billet.numeroVolAller || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-[#A5A6A5]">Trajet</p>
                                    <p className="text-[#565556]">{billet.aeroportDepart} → {billet.aeroportArrivee}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-[#A5A6A5]">Date de départ</p>
                                    <p className="text-[#565556]">{fmtDate(billet.dateVolDepart)}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-[#A5A6A5]">Prix</p>
                                    <p className="text-[#565556]">{billet.prix ? billet.prix.toLocaleString() : 'N/A'} {billet.devise}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* <div className="flex justify-end gap-3 pt-4 border-t border-[#e5e5e5]">
                    <button
                      onClick={() => {
                        setGroupFilterResults(null);
                      }}
                      className="px-5 py-2.5 rounded-lg text-sm font-medium text-[#565556] hover:bg-[#f4f4f4] transition-colors"
                    >
                      Nouvelle recherche
                    </button>
                    <button
                      onClick={() => {
                        setShowGroupFilterModal(false);
                        resetGroupFilter();
                      }}
                      className="px-5 py-2.5 rounded-lg text-sm font-medium bg-[#A11B1B] text-white hover:bg-[#8a1616] transition-colors"
                    >
                      Fermer
                    </button>
                  </div> */}
                </div>
              )}

              {/* Step 2: Flight Results */}
              {workflowStep === 'flights' && flightSearchResults && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-[#565556] flex items-center gap-2">
                      <Plane className="w-5 h-5 text-[#A11B1B]" />
                      Résultats de recherche de vols ({flightSearchResults.total})
                    </h4>
                    <button
                      onClick={handleBackToFilter}
                      className="text-sm text-[#A11B1B] hover:underline"
                    >
                      ← Retour au filtre
                    </button>
                  </div>
                  {flightSearchError && <ErrorAlert error={flightSearchError} onDismiss={() => setFlightSearchError('')} />}
                  {!flightSearchResults.offers || flightSearchResults.offers.length === 0 ? (
                    <p className="text-sm text-[#A5A6A5]">Aucun vol trouvé</p>
                  ) : (
                    <div className="space-y-4">
                      {flightSearchResults.offers.map((offer) => (
                        <div
                          key={offer.id}
                          className={`p-5 rounded-xl bg-gradient-to-br from-[#fafafa] to-white border transition-colors ${
                            selectedFlightOffer === offer.id
                              ? 'border-[#A11B1B] ring-2 ring-[#A11B1B]/20'
                              : 'border-[#e5e5e5] hover:border-[#A11B1B]/30'
                          }`}
                        >
                          <div className="flex items-start gap-3 mb-4">
                            <div className="pt-1">
                              <button
                                onClick={() => handleSelectFlight(offer.id)}
                                className="p-1 rounded hover:bg-[#e5e5e5] transition-colors"
                              >
                                {selectedFlightOffer === offer.id ? (
                                  <CheckSquare className="w-5 h-5 text-[#A11B1B]" />
                                ) : (
                                  <Square className="w-5 h-5 text-[#A5A6A5]" />
                                )}
                              </button>
                            </div>
                            <div className="flex-1">
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
                                <div className="text-right">
                                  <p className="text-2xl font-bold text-[#A11B1B]">{parseFloat(offer.total_amount).toLocaleString()} {offer.total_currency}</p>
                                  <p className="text-xs text-[#A5A6A5]">Total TTC</p>
                                </div>
                              </div>

                              {/* Flight details */}
                              <div className="space-y-3">
                                {offer.slices.map((slice) => (
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
                                      {slice.segments.map((segment) => (
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
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Validation */}
              {workflowStep === 'validation' && (
                <div className="space-y-6">
                  <div className="p-6 rounded-xl bg-gradient-to-r from-[#A11B1B]/5 to-[#8a1616]/5 border border-[#A11B1B]/20 text-center">
                    <CheckCircle2 className="w-16 h-16 text-[#A11B1B] mx-auto mb-4" />
                    <h4 className="text-xl font-bold text-[#565556] mb-2">Budgets vérifiés</h4>
                    <p className="text-sm text-[#A5A6A5]">
                      {selectedBillets.length} billet(s) sélectionné(s) pour le vol {selectedFlightOffer?.slice(-8)}
                    </p>
                    {budgetCheckResult && (
                      <div className="mt-4 space-y-2">
                        <p className="text-xs text-green-700 font-medium">
                          ✓ Tous les budgets sont suffisants
                        </p>
                        <p className="text-xs text-[#A5A6A5]">
                          Montant par personne: {budgetCheckResult.montantParPersonne?.toLocaleString() || '—'} FCFA
                        </p>
                      </div>
                    )}
                  </div>

                  {budgetCheckError && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                      {budgetCheckError}
                    </div>
                  )}
                </div>
              )}
            </ModalBody>

            {/* Fixed Footer */}
            <ModalFooter>
              {workflowStep === 'filter' && !groupFilterResults && (
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowGroupFilterModal(false);
                      resetGroupFilter();
                    }}
                    className="px-5 py-2.5 rounded-lg text-sm font-medium text-[#565556] hover:bg-[#f4f4f4] transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleGroupFilter}
                    disabled={groupFilterLoading}
                    className="px-5 py-2.5 rounded-lg text-sm font-medium bg-[#A11B1B] text-white hover:bg-[#8a1616] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {groupFilterLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Recherche...
                      </>
                    ) : (
                      'Filtrer'
                    )}
                  </button>
                </div>
              )}

              {workflowStep === 'filter' && groupFilterResults && (
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowGroupFilterModal(false);
                      resetGroupFilter();
                    }}
                    className="px-5 py-2.5 rounded-lg text-sm font-medium text-[#565556] hover:bg-[#f4f4f4] transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSearchFlights}
                    disabled={selectedBillets.length === 0 || flightSearchLoading}
                    className="px-5 py-2.5 rounded-lg text-sm font-medium bg-[#A11B1B] text-white hover:bg-[#8a1616] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {flightSearchLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Recherche de vols...
                      </>
                    ) : (
                      `Rechercher des vols (${selectedBillets.length})`
                    )}
                  </button>
                </div>
              )}

              {workflowStep === 'flights' && (
                <div className="flex justify-end gap-3">
                  <button
                    onClick={handleBackToFilter}
                    className="px-5 py-2.5 rounded-lg text-sm font-medium text-[#565556] hover:bg-[#f4f4f4] transition-colors"
                  >
                    Retour
                  </button>
                  <button
                    onClick={handleValidateFlight}
                    disabled={!selectedFlightOffer || budgetCheckLoading}
                    className="px-5 py-2.5 rounded-lg text-sm font-medium bg-[#A11B1B] text-white hover:bg-[#8a1616] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {budgetCheckLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Vérification des budgets...
                      </>
                    ) : (
                      'Valider la sélection'
                    )}
                  </button>
                </div>
              )}

              {workflowStep === 'validation' && (
                <div className="flex justify-end gap-3">
                  <button
                    onClick={handleBackToFlights}
                    className="px-5 py-2.5 rounded-lg text-sm font-medium text-[#565556] hover:bg-[#f4f4f4] transition-colors"
                  >
                    Modifier la sélection
                  </button>
                  <button
                    onClick={handleBookGroupFlight}
                    disabled={budgetCheckLoading}
                    className="px-5 py-2.5 rounded-lg text-sm font-medium bg-[#A11B1B] text-white hover:bg-[#8a1616] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {budgetCheckLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Réservation en cours...
                      </>
                    ) : (
                      'Confirmer la réservation groupée'
                    )}
                  </button>
                </div>
              )}
            </ModalFooter>
          </Modal>
      )}

      {/* Group Booking Success Modal */}
      {showGroupBookingSuccessModal && groupBookingSuccess && (
        <Modal
          isOpen={showGroupBookingSuccessModal}
          onClose={() => setShowGroupBookingSuccessModal(false)}
          size="xl"
        >
          <ModalHeader
            title="Réservation groupée réussie"
            subtitle={`Référence: ${groupBookingSuccess.order.booking_reference}`}
            icon={<CheckCircle2 className="w-5 h-5 text-white" />}
            variant="success"
          />
          <ModalBody className="p-8 space-y-6">
            {/* Order Info */}
            <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
              <h4 className="text-sm font-semibold text-[#565556] mb-3">Détails de la réservation</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[#A5A6A5]">Référence</p>
                  <p className="text-sm font-medium text-[#565556]">{groupBookingSuccess.order.booking_reference}</p>
                </div>
                <div>
                  <p className="text-xs text-[#A5A6A5]">ID de commande</p>
                  <p className="text-sm font-medium text-[#565556]">{groupBookingSuccess.order.id.slice(-8)}</p>
                </div>
                <div>
                  <p className="text-xs text-[#A5A6A5]">Montant total</p>
                  <p className="text-sm font-bold text-[#A11B1B]">{parseFloat(groupBookingSuccess.order.total_amount).toLocaleString()} {groupBookingSuccess.order.currency}</p>
                </div>
                <div>
                  <p className="text-xs text-[#A5A6A5]">Nombre de passagers</p>
                  <p className="text-sm font-medium text-[#565556]">{groupBookingSuccess.totalPassengers}</p>
                </div>
              </div>
            </div>

            {/* Passengers */}
            <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
              <h4 className="text-sm font-semibold text-[#565556] mb-3">Passagers</h4>
              <div className="space-y-2">
                {groupBookingSuccess.passengers.map((matricule, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-[#A11B1B]" />
                    <span className="text-[#565556]">{matricule}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Flight Info */}
            {groupBookingSuccess.order.slices.length > 0 && (
              <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e5]">
                <h4 className="text-sm font-semibold text-[#565556] mb-3">Vol</h4>
                {groupBookingSuccess.order.slices.map((slice: any) => (
                  <div key={slice.id} className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[#565556]">{slice.origin.city_name}</span>
                      <span className="text-[#A5A6A5]">({slice.origin.iata_code})</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#A5A6A5]" />
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[#565556]">{slice.destination.city_name}</span>
                      <span className="text-[#A5A6A5]">({slice.destination.iata_code})</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <button
              onClick={() => setShowGroupBookingSuccessModal(false)}
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
