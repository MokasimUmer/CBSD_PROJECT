import React from 'react';

/**
 * Badge Component
 *
 * Small label for tier badges, notification counts, and status tags.
 *
 * Design Pattern: COMPONENT PATTERN
 */

// ─── Types ───────────────────────────────────────────────────────────

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Visual style variant. */
  variant?: BadgeVariant;
  /** Size preset. */
  size?: BadgeSize;
  /** If true, renders as a small circle (e.g. notification dot). */
  dot?: boolean;
  /** Optional count to display (e.g. notification count). */
  count?: number;
  /** Max count before showing "99+". */
  maxCount?: number;
}

// ─── Component ───────────────────────────────────────────────────────

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  count,
  maxCount = 99,
  className = '',
  style,
  ...rest
}) => {
  // Dot variant — tiny circle indicator
  if (dot) {
    const dotStyle: React.CSSProperties = {
      display: 'inline-block',
      width: size === 'sm' ? 6 : 8,
      height: size === 'sm' ? 6 : 8,
      borderRadius: '50%',
      background: variantColors[variant].bg,
      ...style,
    };
    return <span style={dotStyle} className={`cp-badge-dot ${className}`.trim()} {...rest} />;
  }

  // Count variant
  const displayText =
    count !== undefined
      ? count > maxCount
        ? `${maxCount}+`
        : String(count)
      : undefined;

  const badgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '9999px',
    fontWeight: 600,
    letterSpacing: '0.01em',
    lineHeight: 1,
    whiteSpace: 'nowrap',
    ...badgeSizes[size],
    background: variantColors[variant].bg,
    color: variantColors[variant].text,
    ...style,
  };

  return (
    <span
      style={badgeStyle}
      className={`cp-badge cp-badge--${variant} ${className}`.trim()}
      {...rest}
    >
      {displayText ?? children}
    </span>
  );
};

// ─── Style maps ──────────────────────────────────────────────────────

const badgeSizes: Record<BadgeSize, React.CSSProperties> = {
  sm: { padding: '0.125rem 0.5rem', fontSize: '0.6875rem', minWidth: '1.125rem', height: '1.125rem' },
  md: { padding: '0.175rem 0.625rem', fontSize: '0.75rem', minWidth: '1.375rem', height: '1.375rem' },
};

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
  default: { bg: '#27272a', text: '#d4d4d8' },
  primary: { bg: 'rgba(99, 102, 241, 0.15)', text: '#818cf8' },
  success: { bg: 'rgba(34, 197, 94, 0.15)', text: '#4ade80' },
  warning: { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24' },
  danger: { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171' },
  info: { bg: 'rgba(56, 189, 248, 0.15)', text: '#38bdf8' },
};

Badge.displayName = 'Badge';
