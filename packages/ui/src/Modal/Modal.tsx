import React from 'react';

/**
 * Modal Component
 *
 * Overlay dialog for confirmations, forms, and informational content.
 * Includes backdrop click-to-close and escape key support.
 *
 * Design Pattern: COMPONENT PATTERN
 */

// ─── Types ───────────────────────────────────────────────────────────

export type ModalSize = 'sm' | 'md' | 'lg';

export interface ModalProps {
  /** Whether the modal is visible. */
  isOpen: boolean;
  /** Callback to close the modal. */
  onClose: () => void;
  /** Modal title rendered in the header. */
  title?: string;
  /** Size preset. */
  size?: ModalSize;
  /** Whether clicking the backdrop closes the modal. */
  closeOnBackdrop?: boolean;
  /** Whether pressing Escape closes the modal. */
  closeOnEscape?: boolean;
  /** Content rendered in the modal body. */
  children?: React.ReactNode;
  /** Optional footer content (e.g. action buttons). */
  footer?: React.ReactNode;
}

// ─── Component ───────────────────────────────────────────────────────

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  closeOnBackdrop = true,
  closeOnEscape = true,
  children,
  footer,
}) => {
  // Handle Escape key
  React.useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, closeOnEscape, onClose]);

  // Prevent body scroll when open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const backdropStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(4px)',
    animation: 'cp-fadeIn 0.15s ease-out',
  };

  const panelStyle: React.CSSProperties = {
    background: '#1c1c1e',
    borderRadius: '0.75rem',
    border: '1px solid #27272a',
    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.5)',
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column',
    animation: 'cp-slideUp 0.2s ease-out',
    ...modalSizes[size],
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid #27272a',
    flexShrink: 0,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '1.0625rem',
    fontWeight: 600,
    color: '#fafafa',
    margin: 0,
  };

  const closeButtonStyle: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    color: '#71717a',
    cursor: 'pointer',
    padding: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    borderRadius: '0.375rem',
    transition: 'color 0.15s ease',
  };

  const bodyStyle: React.CSSProperties = {
    padding: '1.25rem',
    overflowY: 'auto',
    flex: 1,
    color: '#d4d4d8',
    fontSize: '0.875rem',
    lineHeight: 1.6,
  };

  const footerStyle: React.CSSProperties = {
    padding: '0.75rem 1.25rem',
    borderTop: '1px solid #27272a',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.5rem',
    flexShrink: 0,
  };

  return (
    <div
      style={backdropStyle}
      className="cp-modal-backdrop"
      onClick={closeOnBackdrop ? onClose : undefined}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        style={panelStyle}
        className="cp-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div style={headerStyle} className="cp-modal__header">
            <h2 style={titleStyle}>{title}</h2>
            <button
              style={closeButtonStyle}
              onClick={onClose}
              aria-label="Close modal"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div style={bodyStyle} className="cp-modal__body">
          {children}
        </div>
        {footer && (
          <div style={footerStyle} className="cp-modal__footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Size map ────────────────────────────────────────────────────────

const modalSizes: Record<ModalSize, React.CSSProperties> = {
  sm: { width: '100%', maxWidth: '24rem' },
  md: { width: '100%', maxWidth: '32rem' },
  lg: { width: '100%', maxWidth: '48rem' },
};

Modal.displayName = 'Modal';
