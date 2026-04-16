import React from 'react';

/**
 * PageWrapper Component
 *
 * Provides consistent page-level layout: max-width container
 * with vertical padding and responsive horizontal margins.
 *
 * Design Pattern: COMPONENT PATTERN
 */

// ─── Types ───────────────────────────────────────────────────────────

export interface PageWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Maximum width of the content area (default: '72rem'). */
  maxWidth?: string;
  /** Vertical padding (default: '2rem'). */
  paddingY?: string;
  /** Horizontal padding (default: '1.5rem'). */
  paddingX?: string;
  /** Centre content horizontally. */
  centered?: boolean;
}

// ─── Component ───────────────────────────────────────────────────────

export const PageWrapper: React.FC<PageWrapperProps> = ({
  children,
  maxWidth = '72rem',
  paddingY = '2rem',
  paddingX = '1.5rem',
  centered = true,
  className = '',
  style,
  ...rest
}) => {
  const wrapperStyle: React.CSSProperties = {
    width: '100%',
    maxWidth,
    padding: `${paddingY} ${paddingX}`,
    ...(centered ? { marginLeft: 'auto', marginRight: 'auto' } : {}),
    ...style,
  };

  return (
    <div
      style={wrapperStyle}
      className={`cp-page-wrapper ${className}`.trim()}
      {...rest}
    >
      {children}
    </div>
  );
};

PageWrapper.displayName = 'PageWrapper';
