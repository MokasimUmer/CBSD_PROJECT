import React from 'react';

/**
 * Input Component
 *
 * Styled text input with label, error message, and helper text support.
 * Works for text, email, password, and search input types.
 *
 * Design Pattern: COMPONENT PATTERN
 */

// ─── Types ───────────────────────────────────────────────────────────

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Visible label above the input. */
  label?: string;
  /** Error message displayed below the input. */
  error?: string;
  /** Helper text displayed below the input (hidden when error is shown). */
  helperText?: string;
  /** Size preset. */
  inputSize?: InputSize;
  /** Element rendered inside the input on the left. */
  leftAddon?: React.ReactNode;
  /** Element rendered inside the input on the right. */
  rightAddon?: React.ReactNode;
  /** Stretch to fill parent width. */
  fullWidth?: boolean;
}

// ─── Component ───────────────────────────────────────────────────────

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  inputSize = 'md',
  leftAddon,
  rightAddon,
  fullWidth = true,
  className = '',
  id,
  style,
  ...rest
}) => {
  const inputId = id || `cp-input-${label?.toLowerCase().replace(/\s+/g, '-') || 'field'}`;
  const hasError = Boolean(error);

  const wrapperStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
    width: fullWidth ? '100%' : 'auto',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: '#d4d4d8',
    letterSpacing: '0.01em',
  };

  const fieldWrapperStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    borderRadius: '0.5rem',
    border: `1.5px solid ${hasError ? '#ef4444' : '#3f3f46'}`,
    background: '#18181b',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    ...inputSizeStyles[inputSize],
  };

  const inputStyle: React.CSSProperties = {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#fafafa',
    fontSize: 'inherit',
    fontFamily: 'inherit',
    width: '100%',
    ...style,
  };

  const addonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    color: '#71717a',
    flexShrink: 0,
  };

  const messageStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    marginTop: '0.125rem',
    color: hasError ? '#ef4444' : '#71717a',
  };

  return (
    <div style={wrapperStyle} className={`cp-input-group ${className}`.trim()}>
      {label && (
        <label htmlFor={inputId} style={labelStyle}>
          {label}
        </label>
      )}
      <div style={fieldWrapperStyle}>
        {leftAddon && <span style={addonStyle}>{leftAddon}</span>}
        <input id={inputId} style={inputStyle} {...rest} />
        {rightAddon && <span style={addonStyle}>{rightAddon}</span>}
      </div>
      {(error || helperText) && (
        <span style={messageStyle}>{error || helperText}</span>
      )}
    </div>
  );
};

// ─── Size map ────────────────────────────────────────────────────────

const inputSizeStyles: Record<InputSize, React.CSSProperties> = {
  sm: { padding: '0.375rem 0.625rem', fontSize: '0.8125rem' },
  md: { padding: '0.5rem 0.75rem', fontSize: '0.875rem' },
  lg: { padding: '0.625rem 1rem', fontSize: '1rem' },
};

Input.displayName = 'Input';
