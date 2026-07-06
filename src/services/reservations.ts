import { apiFetch } from './api';

export interface DemandeVoyageNested {
  id: number;
  matricule: string;
  depart: string;
  arrive: string;
  statut: 'EN_ATTENTE' | 'APPROUVEE' | 'REJETEE' | 'ANNULEE' | 'TERMINEE' | 'EN_COURS';
  user?: {
    id: number;
    prenom: string;
    nom: string;
    matricule: string;
    role: string;
  };
  entreprise?: {
    id: number;
    nom: string;
    identifiant: string;
  };
}

export interface ReservationBillet {
  id: number;
  demandeVoyageId: number;
  allerRetour: boolean;
  numeroReservation: string;
  numeroOrder: string | null;
  compagnieAerienne: string | null;
  numeroVolAller: string | null;
  numeroVolRetour: string | null;
  dateVolDepart: string;
  dateVolArrivee: string | null;
  dateVolRetourDepart: string | null;
  dateVolRetourArrivee: string | null;
  aeroportDepart: string;
  aeroportArrivee: string;
  classe: string;
  prix: number | null;
  devise: string;
  statut: 'EN_ATTENTE' | 'CONFIRMEE' | 'ANNULEE' | 'EMISE';
  numeroBillet: string | null;
  dateEmission: string | null;
  commentaire: string | null;
  createdAt: string;
  updatedAt: string;
  demandeVoyage: DemandeVoyageNested;
}

export interface ReservationHotel {
  id: number;
  demandeVoyageId: number;
  nomHotel: string | null;
  categorie: string;
  adresse: string | null;
  ville: string;
  pays: string | null;
  dateArrivee: string | null;
  dateDepart: string | null;
  nombreNuits: number | null;
  prixParNuit: number | null;
  prixTotal: number | null;
  devise: string;
  statut: 'EN_ATTENTE' | 'CONFIRMEE' | 'ANNULEE';
  numeroConfirmation: string | null;
  commentaire: string | null;
  createdAt: string;
  updatedAt: string;
  demandeVoyage: DemandeVoyageNested;
}

export interface GetReservationsEntrepriseResponse {
  billets: {
    total: number;
    data: ReservationBillet[];
  };
  hotels: {
    total: number;
    data: ReservationHotel[];
  };
}

export interface GetMesReservationsResponse {
  billets: {
    total: number;
    data: ReservationBillet[];
  };
  hotels: {
    total: number;
    data: ReservationHotel[];
  };
}

export interface GetBilletResponse {
  reservation: ReservationBillet;
}

export interface GetHotelResponse {
  reservation: ReservationHotel;
}

export async function getReservationsEntreprise(): Promise<GetReservationsEntrepriseResponse> {
  return apiFetch<GetReservationsEntrepriseResponse>('/reservations/entreprise');
}

export async function getMesReservations(): Promise<GetMesReservationsResponse> {
  return apiFetch<GetMesReservationsResponse>('/reservations/mes-reservations');
}

export async function getBilletById(id: number): Promise<GetBilletResponse> {
  return apiFetch<GetBilletResponse>(`/reservations/billets/${id}`);
}

export async function getHotelById(id: number): Promise<GetHotelResponse> {
  return apiFetch<GetHotelResponse>(`/reservations/hotels/${id}`);
}
