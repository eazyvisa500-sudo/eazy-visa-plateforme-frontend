import { ApiError } from '../lib/api-errors';
import type { ApiErrorResponse } from '../lib/api-errors';

export const API_BASE_URL = 'http://localhost:3000/api';
export const SERVER_BASE_URL = API_BASE_URL.replace(/\/api$/, '');

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const isFormData = options.body instanceof FormData;
  const skipAuth = (options as any).skipAuth === true;

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...((options.headers as Record<string, string>) || {}),
  };

  if (!skipAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null) as ApiErrorResponse | null;

  if (!response.ok) {
    console.error('API Error Response:', data);

    // Redirection vers login si 401 (non authentifié)
    // if (response.status === 401 && !skipAuth) {
    //   localStorage.removeItem('token');
    //   window.location.href = '/connexion';
    // }

    const nestedError = data && typeof data.error === 'object' ? data.error : undefined;
    const duffelErrors = data?.errors
      || data?.duffelErrors
      || nestedError?.details?.duffelErrors
      || [];
    const duffelError = duffelErrors[0];
    const duffelErrorMessages: Record<string, string> = {
      already_cancelled: 'Cette commande a déjà été annulée.',
      order_not_cancellable: 'Cette commande ne peut pas être annulée.',
      invalid_state_error: 'État de la commande invalide pour l\'annulation.',
      cancellation_deadline_passed: 'Le délai d\'annulation est dépassé.',
    };
    const errorMessage = (duffelError?.code && duffelErrorMessages[duffelError.code])
      || duffelError?.message
      || nestedError?.message
      || data?.message
      || (typeof data?.error === 'string' ? data.error : undefined)
      || `Erreur ${response.status}`;
    const errorCode = duffelError?.code || nestedError?.code || data?.code;

    throw new ApiError(errorMessage, response.status, errorCode, data || undefined);
  }

  return data as T;
}
