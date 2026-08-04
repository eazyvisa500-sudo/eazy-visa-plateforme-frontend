import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalContextValue {
  onClose: () => void;
  titleId: string;
  registerTitle: () => void;
  unregisterTitle: () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

function useModalContext() {
  const ctx = useContext(ModalContext);
  if (!ctx) {
    throw new Error('Modal subcomponents must be rendered inside <Modal>');
  }
  return ctx;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  closeOnEscape?: boolean;
  closeOnOverlay?: boolean;
  className?: string;
  ariaLabel?: string;
}

const sizeClasses: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  '2xl': 'max-w-4xl',
  full: 'max-w-[95%]',
};

export function Modal({
  isOpen,
  onClose,
  children,
  size = 'md',
  closeOnEscape = true,
  closeOnOverlay = true,
  className = '',
  ariaLabel,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const wasOpenRef = useRef(false);
  const titleId = useId();
  const [hasTitle, setHasTitle] = useState(false);

  const registerTitle = useCallback(() => setHasTitle(true), []);
  const unregisterTitle = useCallback(() => setHasTitle(false), []);

  useEffect(() => {
    if (!isOpen) {
      wasOpenRef.current = false;
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const panel = panelRef.current;
    const focusable = panel?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );

    if (!wasOpenRef.current) {
      focusable?.[0]?.focus();
      wasOpenRef.current = true;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && closeOnEscape) {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !focusable || focusable.length === 0) return;

      const enabled = Array.from(focusable).filter(
        (el) => !el.hasAttribute('disabled') && el.tabIndex >= 0,
      );

      if (enabled.length === 0) return;

      const first = enabled[0];
      const last = enabled[enabled.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose, closeOnEscape]);

  const handleOverlayClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (closeOnOverlay && event.target === event.currentTarget) {
        onClose();
      }
    },
    [closeOnOverlay, onClose],
  );

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={handleOverlayClick}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={hasTitle ? titleId : undefined}
        aria-label={!hasTitle ? ariaLabel || 'Dialogue' : undefined}
        className={`bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden flex flex-col ${className}`}
      >
        <ModalContext.Provider
          value={{ onClose, titleId, registerTitle, unregisterTitle }}
        >
          {children}
        </ModalContext.Provider>
      </div>
    </div>,
    document.body,
  );
}

interface ModalHeaderProps {
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  variant?: 'brand' | 'success' | 'neutral';
  children?: ReactNode;
}

export function ModalHeader({
  title,
  subtitle,
  icon,
  variant = 'neutral',
  children,
}: ModalHeaderProps) {
  const { onClose, titleId, registerTitle, unregisterTitle } = useModalContext();

  useEffect(() => {
    if (title) {
      registerTitle();
      return () => unregisterTitle();
    }
  }, [title, registerTitle, unregisterTitle]);

  const variantClasses = {
    brand: 'bg-gradient-to-r from-[#A11B1B] to-[#8a1616] text-white',
    success: 'bg-gradient-to-r from-green-600 to-green-700 text-white',
    neutral: 'bg-white text-[#565556] border-b border-[#e5e5e5]',
  };

  const iconWrapperClasses = {
    brand: 'bg-white/20',
    success: 'bg-white/20',
    neutral: 'bg-[#A11B1B]/10',
  };

  return (
    <div
      className={`sticky top-0 px-6 py-4 rounded-t-2xl flex items-center gap-3 shrink-0 ${variantClasses[variant]}`}
    >
      {icon && (
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconWrapperClasses[variant]}`}
        >
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        {title && (
          <h3 id={titleId} className="text-lg font-bold truncate">
            {title}
          </h3>
        )}
        {subtitle && (
          <p
            className={`text-sm truncate ${
              variant === 'neutral' ? 'text-[#A5A6A5]' : 'text-white/80'
            }`}
          >
            {subtitle}
          </p>
        )}
      </div>
      <div className="ml-auto flex items-center gap-2 shrink-0">
        {children}
        <button
          type="button"
          onClick={onClose}
          className={`p-2 rounded-lg transition-colors ${
            variant === 'neutral'
              ? 'hover:bg-[#f4f4f4] text-[#A5A6A5]'
              : 'hover:bg-white/20 text-white'
          }`}
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

interface ModalBodyProps {
  children: ReactNode;
  className?: string;
}

export function ModalBody({ children, className = '' }: ModalBodyProps) {
  return (
    <div className={`p-6 overflow-y-auto flex-1 min-h-0 ${className}`}>
      {children}
    </div>
  );
}

interface ModalFooterProps {
  children: ReactNode;
  className?: string;
}

export function ModalFooter({ children, className = '' }: ModalFooterProps) {
  return (
    <div
      className={`px-6 py-4 border-t border-[#e5e5e5] flex items-center justify-end gap-3 shrink-0 ${className}`}
    >
      {children}
    </div>
  );
}
