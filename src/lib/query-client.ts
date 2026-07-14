import { QueryClient } from '@tanstack/react-query';
import { getErrorMessage, isApiError } from './api-errors';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Ne pas réessayer en cas d'erreur 4xx (client error)
        if (isApiError(error) && error.status >= 400 && error.status < 500) {
          return false;
        }
        // Réessayer une fois pour les erreurs 5xx (server error)
        return failureCount < 1;
      },
    },
    mutations: {
      retry: false,
    },
  },
});

// Hook pour afficher les erreurs de manière centralisée
export function handleQueryError(error: unknown): string {
  const message = getErrorMessage(error);
  console.error('Query Error:', error);
  return message;
}
