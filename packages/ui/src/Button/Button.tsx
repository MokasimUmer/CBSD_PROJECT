import React from 'react';

/**
 * Button Component
 *
 * A versatile button with multiple visual variants, sizes,
 * and states. Supports full-width mode and icon placement.
 *
 * Design Pattern: COMPONENT PATTERN
 *   Encapsulates styling and behaviour behind a clean prop interface.
 */

// ─── Types ───────────────────────────────────────────────────────────

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant. */
  variant?: ButtonVariant;
  /** Size preset. */
  size?: ButtonSize;
  /** Stretch to fill parent width. */
  fullWidth?: boolean;
  /** Show a loading spinner and disable interaction. */
  loading?: boolean;
  /** Element rendered before the button label. */
  leftIcon?: React.ReactNode;
  /** Element rendered after the button label. */
  rightIcon?: React.ReactNode;
}

// ─── Component ───────────────────────────────────────────────────────

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  style,
  ...rest
}) => {
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    borderRadius: '0.5rem',
    fontWeight: 600,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.55 : 1,
    transition: 'all 0.2s ease',
    border: 'none',
    outline: 'none',
    fontFamily: 'inherit',
    width: fullWidth ? '100%' : 'auto',
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...style,
  };

  return (
    <button
      style={baseStyles}
      disabled={disabled || loading}
      className={`cp-btn cp-btn--${variant} cp-btn--${size} ${className}`.trim()}
      {...rest}
    >
      {loading ? <LoadingSpinner size={size} /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
};

// ─── Style maps ──────────────────────────────────────────────────────

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: { padding: '0.375rem 0.75rem', fontSize: '0.8125rem', lineHeight: '1.25rem' },
  md: { padding: '0.5rem 1rem', fontSize: '0.875rem', lineHeight: '1.5rem' },
  lg: { padding: '0.625rem 1.5rem', fontSize: '1rem', lineHeight: '1.75rem' },
};

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#ffffff',
  },
  secondary: {
    background: 'transparent',
    color: '#6366f1',
    border: '1.5px solid #6366f1',
  },
  ghost: {
    background: 'transparent',
    color: '#a1a1aa',
  },
  danger: {
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
    color: '#ffffff',
  },
};

// ─── Loading spinner ─────────────────────────────────────────────────

const spinnerSizes: Record<ButtonSize, number> = { sm: 14, md: 16, lg: 18 };

const LoadingSpinner: React.FC<{ size: ButtonSize }> = ({ size }) => {
  const s = spinnerSizes[size];
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      style={{ animation: 'cp-spin 0.8s linear infinite' }}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
};

Button.displayName = 'Button';
