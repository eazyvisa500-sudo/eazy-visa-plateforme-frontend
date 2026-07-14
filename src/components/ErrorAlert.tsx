import { X } from 'lucide-react';
import { getErrorMessage, isApiError } from '../lib/api-errors';

interface ErrorAlertProps {
  error: unknown;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorAlert({ error, onDismiss, className = '' }: ErrorAlertProps) {
  const message = getErrorMessage(error);
  
  // Déterminer le type d'erreur pour le style
  let alertType = 'error';
  if (isApiError(error)) {
    if (error.status === 401) alertType = 'warning';
    else if (error.status === 403) alertType = 'warning';
    else if (error.status === 404) alertType = 'info';
    else if (error.status >= 500) alertType = 'error';
  }

  const alertStyles = {
    error: 'bg-red-50 border-red-200 text-red-700',
    warning: 'bg-amber-50 border-amber-200 text-amber-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700',
  };

  const iconColors = {
    error: 'text-red-500',
    warning: 'text-amber-500',
    info: 'text-blue-500',
  };

  return (
    <div className={`px-4 py-3 rounded-lg border ${alertStyles[alertType]} ${className}`}>
      <div className="flex items-start gap-2">
        <div className="flex-1 text-sm">
          {message}
          {isApiError(error) && error.code && (
            <span className="ml-2 text-xs opacity-70">
              (Code: {error.code})
            </span>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`p-1 rounded hover:bg-black/5 transition-colors ${iconColors[alertType]}`}
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
