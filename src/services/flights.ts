import { apiFetch } from './api';

export interface FlightSearchRequest {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers?: number;
  cabinClass?: string;
  maxStops?: number;
  limit?: number;
  offset?: number;
}

export interface Airport {
  id: string;
  iata_code: string;
  icao_code: string;
  name: string;
  city_name: string;
  iata_city_code: string;
  iata_country_code: string;
  latitude: number;
  longitude: number;
  time_zone: string;
}

export interface Airline {
  id: string;
  iata_code: string;
  name: string;
  logo_symbol_url: string;
  logo_lockup_url: string;
  conditions_of_carriage_url: string;
}

export interface Aircraft {
  id: string;
  iata_code: string;
  name: string;
}

export interface CabinAmenities {
  seat: {
    pitch: string;
    legroom: string;
    type: string;
  };
  wifi: {
    available: boolean;
    cost: string;
  };
  power: {
    available: boolean;
  };
}

export interface Cabin {
  name: string;
  marketing_name: string;
  amenities: CabinAmenities;
}

export interface Baggage {
  type: string;
  quantity: number;
}

export interface SegmentPassenger {
  passenger_id: string;
  cabin_class: string;
  cabin_class_marketing_name: string;
  fare_basis_code: string;
  cabin: Cabin;
  baggages: Baggage[];
}

export interface Segment {
  id: string;
  origin: Airport;
  destination: Airport;
  departing_at: string;
  arriving_at: string;
  duration: string;
  stops: any[];
  operating_carrier: Airline;
  marketing_carrier: Airline;
  operating_carrier_flight_number: string;
  marketing_carrier_flight_number: string;
  aircraft: Aircraft | null;
  passengers: SegmentPassenger[];
  origin_terminal: string | null;
  destination_terminal: string | null;
}

export interface Slice {
  id: string;
  origin: Airport;
  destination: Airport;
  duration: string;
  segments: Segment[];
  fare_brand_name: string;
  conditions: {
    change_before_departure: any;
    priority_check_in: any;
    priority_boarding: any;
    advance_seat_selection: any;
  };
}

export interface OfferConditions {
  refund_before_departure: any;
  change_before_departure: any;
}

export interface PaymentRequirements {
  requires_instant_payment: boolean;
  price_guarantee_expires_at: string | null;
  payment_required_by: string;
}

export interface FlightOffer {
  id: string;
  total_amount: string;
  base_amount: string;
  tax_amount: string;
  total_currency: string;
  base_currency: string;
  tax_currency: string;
  total_emissions_kg: string;
  owner: Airline;
  slices: Slice[];
  passengers: {
    id: string;
    type: string;
    age: number | null;
    given_name: string | null;
    family_name: string | null;
  }[];
  conditions: OfferConditions;
  payment_requirements: PaymentRequirements;
  expires_at: string;
  created_at: string;
  updated_at: string;
  fare_brand_name?: string;
}

export interface FlightSearchResponse {
  offer_request_id: string;
  offers: FlightOffer[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

export interface BookingRequest {
  selected_offers: string[];
  matricule: string;
  passenger_id: string;
  demandeVoyageId: number;
}

export interface BookingResponse {
  id: string;
  booking_reference: string;
  total_amount: string;
  currency: string;
  slices: any[];
  passengers: any[];
  documents: any[];
}

export interface BookGroupRequest {
  selected_offers: string[];
  matricules: string[];
  passenger_ids: string[];
  demandeVoyageIds: number[];
}

export interface BookGroupResponse {
  order: {
    id: string;
    booking_reference: string;
    total_amount: string;
    currency: string;
    slices: any[];
    passengers: any[];
    documents: any[];
  };
  passengers: string[];
  totalPassengers: number;
}

export interface CancellationCheckRequest {
  orderId: string;
}

export interface CancellationQuote {
  refund_to: string;
  refund_currency: string;
  refund_amount: string;
  confirmed_at: string | null;
  airline_credits: any[];
  order_id: string;
  created_at: string;
  live_mode: boolean;
  expires_at: string;
  id: string;
}

export interface CancellationCheckResponse {
  data: CancellationQuote;
}

export interface CancellationConfirmRequest {
  orderId: string;
}

export interface CancellationConfirmResponse {
  data: CancellationQuote;
}

export interface SearchAdvancedRequest {
  dateDepart: string;
  dateRetour?: string;
  aeroportDepart: string;
  aeroportArrivee: string;
  classe: 'economy' | 'premium_economy' | 'business' | 'first';
  nombrePassenger: number;
}

export interface SearchAdvancedResponse {
  offer_request_id: string;
  offers: FlightOffer[];
  total: number;
}

export async function searchFlights(request: FlightSearchRequest): Promise<FlightSearchResponse> {
  try {
    const response = await apiFetch('/flights/search', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return response as FlightSearchResponse;
  } catch (error) {
    console.error('Error searching flights:', error);
    throw error;
  }
}

export async function searchAdvancedFlights(request: SearchAdvancedRequest): Promise<SearchAdvancedResponse> {
  try {
    const response = await apiFetch('/flights/search-advanced', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return response as SearchAdvancedResponse;
  } catch (error) {
    console.error('Error searching advanced flights:', error);
    throw error;
  }
}

export async function bookFlight(request: BookingRequest): Promise<BookingResponse> {
  try {
    const response = await apiFetch('/flights/book', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return response as BookingResponse;
  } catch (error) {
    console.error('Error booking flight:', error);
    throw error;
  }
}

export async function bookGroupFlight(request: BookGroupRequest): Promise<BookGroupResponse> {
  try {
    const response = await apiFetch('/flights/book-group', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return response as BookGroupResponse;
  } catch (error) {
    console.error('Error booking group flight:', error);
    throw error;
  }
}

export async function getOrderById(orderId: string): Promise<BookingResponse> {
  try {
    const response = await apiFetch(`/flights/orders/${orderId}`);
    return response as BookingResponse;
  } catch (error) {
    console.error('Error getting order:', error);
    throw error;
  }
}

export async function checkCancellation(request: CancellationCheckRequest): Promise<CancellationCheckResponse> {
  try {
    const response = await apiFetch('/flights/cancel/check', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return response as CancellationCheckResponse;
  } catch (error) {
    console.error('Error checking cancellation:', error);
    throw error;
  }
}

export async function confirmCancellation(request: CancellationConfirmRequest): Promise<CancellationConfirmResponse> {
  try {
    const response = await apiFetch('/flights/cancel/confirm', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return response as CancellationConfirmResponse;
  } catch (error) {
    console.error('Error confirming cancellation:', error);
    throw error;
  }
}

export function formatDuration(isoDuration: string): string {
  // Parse PT5H30M format
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return isoDuration;
  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;
  if (hours === 0) return `${minutes}min`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}min`;
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
