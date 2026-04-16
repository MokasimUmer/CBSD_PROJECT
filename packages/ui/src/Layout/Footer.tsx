import React from 'react';

/**
 * Footer Component
 *
 * Simple page footer with branding, links, and copyright.
 *
 * Design Pattern: COMPONENT PATTERN
 */

// ─── Types ───────────────────────────────────────────────────────────

export interface FooterProps extends React.HTMLAttributes<HTMLElement> {
  /** Brand or copyright text rendered on the left. */
  brand?: React.ReactNode;
  /** Link groups or navigation items. */
  links?: React.ReactNode;
  /** Additional content rendered on the right. */
  extra?: React.ReactNode;
}

// ─── Component ───────────────────────────────────────────────────────

export const Footer: React.FC<FooterProps> = ({
  brand,
  links,
  extra,
  className = '',
  style,
  ...rest
}) => {
  const footerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1.25rem 1.5rem',
    borderTop: '1px solid #27272a',
    background: '#09090b',
    color: '#71717a',
    fontSize: '0.8125rem',
    flexWrap: 'wrap',
    gap: '1rem',
    ...style,
  };

  const linksStyle: React.CSSProperties = {
    display: 'flex',
    gap: '1.25rem',
    flexWrap: 'wrap',
  };

  return (
    <footer
      style={footerStyle}
      className={`cp-footer ${className}`.trim()}
      {...rest}
    >
      <div className="cp-footer__brand">{brand}</div>
      {links && (
        <div style={linksStyle} className="cp-footer__links">
          {links}
        </div>
      )}
      {extra && (
        <div className="cp-footer__extra">{extra}</div>
      )}
    </footer>
  );
};

Footer.displayName = 'Footer';
