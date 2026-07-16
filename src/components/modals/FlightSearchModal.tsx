// components/FlightSearchModal.tsx
import { useState } from 'react';
import {
  Plane,
  Ticket,
  XCircle,
  Loader2,
  Eye,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import { AirportAutocomplete } from './AirportAutocomplete';
import { ErrorAlert } from '../ErrorAlert';
import {
  searchFlights,
  formatDuration,
  formatDateTime,
  type FlightSearchRequest,
  type FlightSearchResponse,
} from '../../services/flights';
import { getErrorMessage } from '../../lib/api-errors';

interface FlightSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrigin?: string;
  initialDestination?: string;
  initialDepartureDate?: string;
  initialReturnDate?: string;
  initialPassengers?: number;
  initialCabinClass?: string;
  initialMaxStops?: number;
  initialLimit?: number;
  initialOffset?: number;
  onSelectOffer?: (offer: any) => void;
}

export function FlightSearchModal({
  isOpen,
  onClose,
  initialOrigin = '',
  initialDestination = '',
  initialDepartureDate = '',
  initialReturnDate = '',
  initialPassengers = 1,
  initialCabinClass = 'economy',
  initialMaxStops = 2,
  initialLimit = 20,
  initialOffset = 0,
  onSelectOffer,
}: FlightSearchModalProps) {
  // États pour le formulaire
  const [searchOrigin, setSearchOrigin] = useState(initialOrigin);
  const [searchDestination, setSearchDestination] = useState(initialDestination);
  const [searchDepartureDate, setSearchDepartureDate] = useState(initialDepartureDate);
  const [searchReturnDate, setSearchReturnDate] = useState(initialReturnDate);
  const [searchPassengers, setSearchPassengers] = useState(initialPassengers);
  const [searchCabinClass, setSearchCabinClass] = useState(initialCabinClass);
  const [searchMaxStops, setSearchMaxStops] = useState(initialMaxStops);
  const [searchLimit, setSearchLimit] = useState(initialLimit);
  const [searchOffset, setSearchOffset] = useState(initialOffset);

  // États pour les résultats et le chargement
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [searchResults, setSearchResults] = useState<FlightSearchResponse | null>(null);

  // Réinitialisation des champs (sans fermer la modale)
  const resetSearch = () => {
    setSearchOrigin(initialOrigin);
    setSearchDestination(initialDestination);
    setSearchDepartureDate(initialDepartureDate);
    setSearchReturnDate(initialReturnDate);
    setSearchPassengers(initialPassengers);
    setSearchCabinClass(initialCabinClass);
    setSearchMaxStops(initialMaxStops);
    setSearchLimit(initialLimit);
    setSearchOffset(initialOffset);
    setSearchResults(null);
    setSearchError('');
  };

  // Fonction de recherche avec offset optionnel
  const performSearch = async (offset?: number) => {
    const effectiveOffset = offset !== undefined ? offset : searchOffset;
    // Si on passe un offset, on met à jour le state
    if (offset !== undefined) {
      setSearchOffset(offset);
    }

    // Validation
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
        offset: effectiveOffset,
      };

      const results = await searchFlights(request);
      setSearchResults(results);
    } catch (error) {
      setSearchError(getErrorMessage(error));
    } finally {
      setSearchLoading(false);
    }
  };

  // Pagination
  const handlePrevious = async () => {
    if (!searchResults) return;
    const newOffset = Math.max(0, searchResults.pagination.offset - searchResults.pagination.limit);
    await performSearch(newOffset);
  };

  const handleNext = async () => {
    if (!searchResults || !searchResults.pagination.has_more) return;
    const newOffset = searchResults.pagination.offset + searchResults.pagination.limit;
    await performSearch(newOffset);
  };

  // Fermeture avec réinitialisation complète
  const handleClose = () => {
    resetSearch();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-8">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* En-tête sticky */}
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
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-white/20 text-white transition-colors"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Corps de la modale */}
        <div className="p-8 space-y-6">
          {/* Formulaire */}
          <div className="grid grid-cols-2 gap-4">
            <AirportAutocomplete
              label="Aéroport de départ"
              value={searchOrigin}
              onChange={setSearchOrigin}
              placeholder="Ex: Paris, CDG..."
              required
            />
            <AirportAutocomplete
              label="Aéroport d'arrivée"
              value={searchDestination}
              onChange={setSearchDestination}
              placeholder="Ex: New York, JFK..."
              required
            />
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

          {searchError && <ErrorAlert error={searchError} onDismiss={() => setSearchError('')} />}

          <div className="flex justify-end gap-3 pt-4 border-t border-[#e5e5e5]">
            <button
              onClick={handleClose}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-[#565556] hover:bg-[#f4f4f4] transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={() => performSearch()}
              disabled={searchLoading}
              className="px-5 py-2.5 rounded-lg bg-[#A11B1B] text-white text-sm font-medium hover:bg-[#8a1616] transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {searchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {searchLoading ? 'Recherche...' : 'Rechercher'}
            </button>
          </div>

          {/* Résultats */}
          {searchResults && (
            <div className="mt-6 pt-6 border-t border-[#e5e5e5]">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-[#565556]">
                  Résultats ({searchResults.offers.length} offres trouvées)
                </h4>
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
                      <div
                        key={offer.id}
                        className="p-5 rounded-xl bg-gradient-to-br from-[#fafafa] to-white border border-[#e5e5e5] hover:border-[#A11B1B]/30 transition-colors"
                      >
                        {/* En-tête de l'offre */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {offer.owner.logo_symbol_url && (
                              <img
                                src={offer.owner.logo_symbol_url}
                                alt={offer.owner.name}
                                className="w-12 h-12 rounded-xl object-contain bg-white p-2 shadow-sm"
                              />
                            )}
                            <div>
                              <p className="text-sm font-semibold text-[#565556]">{offer.owner.name}</p>
                              <p className="text-xs text-[#A5A6A5]">Offre {offer.id.slice(-8)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-2xl font-bold text-[#A11B1B]">
                                {parseFloat(offer.total_amount).toLocaleString()} {offer.total_currency}
                              </p>
                              <p className="text-xs text-[#A5A6A5]">Total TTC</p>
                            </div>
                            <button
                              onClick={() => onSelectOffer?.(offer)}
                              className="p-2 rounded-lg hover:bg-[#e5e5e5] text-[#565556] transition-colors"
                              title="Voir les détails"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        {/* Détails des slices */}
                        <div className="space-y-3">
                          {offer.slices.map((slice: any) => (
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

                              {slice.segments.map((segment: any) => (
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
                          ))}
                        </div>

                        {/* Répartition des prix */}
                        <div className="mt-4 pt-4 border-t border-[#e5e5e5] grid grid-cols-3 gap-3 text-xs">
                          <div className="p-2 rounded bg-[#fafafa]">
                            <p className="text-[#A5A6A5]">Prix de base</p>
                            <p className="font-medium text-[#565556]">
                              {parseFloat(offer.base_amount).toLocaleString()} {offer.base_currency}
                            </p>
                          </div>
                          <div className="p-2 rounded bg-[#fafafa]">
                            <p className="text-[#A5A6A5]">Taxes</p>
                            <p className="font-medium text-[#565556]">
                              {parseFloat(offer.tax_amount).toLocaleString()} {offer.tax_currency}
                            </p>
                          </div>
                          <div className="p-2 rounded bg-[#fafafa]">
                            <p className="text-[#A5A6A5]">Émissions CO₂</p>
                            <p className="font-medium text-[#565556]">
                              {parseFloat(offer.total_emissions_kg).toLocaleString()} kg
                            </p>
                          </div>
                        </div>

                        {/* Conditions */}
                        <div className="mt-3 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            {offer.conditions.refund_before_departure?.allowed && (
                              <span className="px-2 py-1 rounded-full bg-green-50 text-green-700 font-medium">
                                Remboursable
                              </span>
                            )}
                            {offer.conditions.change_before_departure?.allowed && (
                              <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">
                                Modifiable
                              </span>
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
                      Page{' '}
                      {Math.floor(searchResults.pagination.offset / searchResults.pagination.limit) + 1}{' '}
                      sur {Math.ceil(searchResults.pagination.total / searchResults.pagination.limit)}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePrevious}
                        disabled={searchResults.pagination.offset === 0 || searchLoading}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-[#565556] hover:bg-[#f4f4f4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Précédent
                      </button>
                      <button
                        onClick={handleNext}
                        disabled={!searchResults.pagination.has_more || searchLoading}
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
  );
}