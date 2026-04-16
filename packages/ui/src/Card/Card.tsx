import React from 'react';

/**
 * Card Component
 *
 * Versatile container component used for content cards, pricing cards,
 * creator profiles, and any boxed content area.
 *
 * Design Pattern: COMPONENT PATTERN
 */

// ─── Types ───────────────────────────────────────────────────────────

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'glass';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual style variant. */
  variant?: CardVariant;
  /** Optional padding override. */
  padding?: string;
  /** Whether the card responds to hover with a subtle lift effect. */
  hoverable?: boolean;
  /** Optional header content rendered at the top of the card. */
  header?: React.ReactNode;
  /** Optional footer content rendered at the bottom of the card. */
  footer?: React.ReactNode;
}

// ─── Component ───────────────────────────────────────────────────────

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = '1.25rem',
  hoverable = false,
  header,
  footer,
  className = '',
  style,
  ...rest
}) => {
  const cardStyle: React.CSSProperties = {
    borderRadius: '0.75rem',
    overflow: 'hidden',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    ...variantStyles[variant],
    ...style,
  };

  const bodyStyle: React.CSSProperties = {
    padding,
  };

  const sectionStyle: React.CSSProperties = {
    padding: `0.75rem ${padding}`,
    borderColor: '#27272a',
  };

  return (
    <div
      style={cardStyle}
      className={`cp-card cp-card--${variant} ${hoverable ? 'cp-card--hoverable' : ''} ${className}`.trim()}
      {...rest}
    >
      {header && (
        <div style={{ ...sectionStyle, borderBottom: '1px solid #27272a' }} className="cp-card__header">
          {header}
        </div>
      )}
      <div style={bodyStyle} className="cp-card__body">
        {children}
      </div>
      {footer && (
        <div style={{ ...sectionStyle, borderTop: '1px solid #27272a' }} className="cp-card__footer">
          {footer}
        </div>
      )}
    </div>
  );
};

// ─── Variant styles ──────────────────────────────────────────────────

const variantStyles: Record<CardVariant, React.CSSProperties> = {
  default: {
    background: '#1c1c1e',
    border: '1px solid #27272a',
  },
  elevated: {
    background: '#1c1c1e',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)',
  },
  outlined: {
    background: 'transparent',
    border: '1.5px solid #3f3f46',
  },
  glass: {
    background: 'rgba(255, 255, 255, 0.04)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
};

Card.displayName = 'Card';
