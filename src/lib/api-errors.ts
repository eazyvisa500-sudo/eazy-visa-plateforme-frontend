// Types pour les codes d'erreur API personnalisés
export type ApiErrorCode =
  | 'MISSING_FIELDS'
  | 'MISSING_CREDENTIALS'
  | 'INVALID_CREDENTIALS'
  | 'ACCOUNT_BLOCKED'
  | 'CONFIG_MISSING'
  | 'BUDGET_CLOTURE'
  | 'BUDGET_ALREADY_ACTIVE'
  | 'BUDGET_NOT_ACTIVE'
  | 'BUDGET_ALREADY_CLOSED'
  | 'BUDGET_HAS_CHILDREN'
  | 'BUDGET_BLOQUE'
  | 'CLASSE_NON_AUTORISEE'
  | 'STATUT_INVALIDE'
  | 'DEPARTEMENT_EXISTS'
  | 'DEPARTEMENT_NOT_FOUND'
  | 'DEPARTEMENT_HAS_USERS'
  | 'ENTREPRISE_INACTIVE'
  | 'EMAIL_EXISTS'
  | 'POLITIQUE_EXISTS'
  | 'INVALID_HOTEL'
  | 'MISSING_RETURN_DATE'
  | 'MISSING_TOKEN_FIELDS'
  | 'MISSING_QUERY_PARAM';

export interface ApiErrorResponse {
  message: string;
  code?: ApiErrorCode;
  error?: string;
  errorDetails?: unknown;
  duffelErrors?: unknown[];
  duffelMeta?: unknown;
}

export class ApiError extends Error {
  status: number;
  code?: ApiErrorCode;
  data?: ApiErrorResponse;

  constructor(message: string, status: number, code?: ApiErrorCode, data?: ApiErrorResponse) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

// Messages utilisateur pour les codes d'erreur personnalisés
export const ERROR_MESSAGES: Record<ApiErrorCode, string> = {
  MISSING_FIELDS: 'Certains champs requis sont manquants',
  MISSING_CREDENTIALS: 'Veuillez fournir votre email et mot de passe',
  INVALID_CREDENTIALS: 'Email ou mot de passe incorrect',
  ACCOUNT_BLOCKED: 'Votre compte a été bloqué. Contactez l\'administrateur',
  CONFIG_MISSING: 'Erreur de configuration du serveur',
  BUDGET_CLOTURE: 'Ce budget est clôturé et ne peut plus être modifié',
  BUDGET_ALREADY_ACTIVE: 'Ce budget est déjà actif',
  BUDGET_NOT_ACTIVE: 'Ce budget n\'est pas actif',
  BUDGET_ALREADY_CLOSED: 'Ce budget est déjà clôturé',
  BUDGET_HAS_CHILDREN: 'Ce budget a des allocations et ne peut être supprimé',
  BUDGET_BLOQUE: 'Ce budget est bloqué',
  CLASSE_NON_AUTORISEE: 'Cette classe de vol n\'est pas autorisée par votre politique',
  STATUT_INVALIDE: 'Le statut actuel ne permet pas cette action',
  DEPARTEMENT_EXISTS: 'Ce département existe déjà',
  DEPARTEMENT_NOT_FOUND: 'Département non trouvé',
  DEPARTEMENT_HAS_USERS: 'Ce département contient des employés et ne peut être supprimé',
  ENTREPRISE_INACTIVE: 'L\'entreprise est désactivée',
  EMAIL_EXISTS: 'Cet email est déjà utilisé',
  POLITIQUE_EXISTS: 'Une politique existe déjà pour cet employé',
  INVALID_HOTEL: 'Catégorie d\'hôtel invalide',
  MISSING_RETURN_DATE: 'La date de retour est requise',
  MISSING_TOKEN_FIELDS: 'Certains champs token sont manquants',
  MISSING_QUERY_PARAM: 'Paramètre de recherche manquant',
};

// Messages pour les codes HTTP standard
export const HTTP_ERROR_MESSAGES: Record<number, string> = {
  400: 'Requête invalide',
  401: 'Non authentifié',
  403: 'Accès refusé',
  404: 'Ressource non trouvée',
  409: 'Conflit de données',
  429: 'Trop de requêtes. Réessayez plus tard',
  500: 'Erreur serveur',
};

export function getErrorMessage(error: unknown): string {
  // Si c'est déjà une chaîne, la retourner directement
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof ApiError) {
    // Priorité au message de l'erreur ApiError (qui contient déjà le message extrait)
    if (error.message) {
      return error.message;
    }
    // Fallback au message dans data si disponible
    if (error.data?.message) {
      return error.data.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Une erreur inattendue est survenue';
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
