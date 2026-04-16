import React from 'react';

/**
 * Navbar Component
 *
 * Top navigation bar with branding, navigation links, and user actions area.
 *
 * Design Pattern: COMPONENT PATTERN
 */

// ─── Types ───────────────────────────────────────────────────────────

export interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
  /** Brand/logo content rendered on the left. */
  brand?: React.ReactNode;
  /** Navigation links rendered in the centre. */
  links?: React.ReactNode;
  /** Actions (e.g. avatar, bell icon) rendered on the right. */
  actions?: React.ReactNode;
  /** Whether the navbar has a fixed position at the top. */
  sticky?: boolean;
  /** Whether to use a glass/blur background effect. */
  transparent?: boolean;
}

// ─── Component ───────────────────────────────────────────────────────

export const Navbar: React.FC<NavbarProps> = ({
  brand,
  links,
  actions,
  sticky = true,
  transparent = false,
  className = '',
  style,
  ...rest
}) => {
  const navStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 1.5rem',
    height: '3.5rem',
    borderBottom: '1px solid #27272a',
    ...(sticky
      ? { position: 'sticky', top: 0, zIndex: 1000 }
      : {}),
    ...(transparent
      ? {
          background: 'rgba(9, 9, 11, 0.75)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }
      : { background: '#09090b' }),
    ...style,
  };

  const brandStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontWeight: 700,
    fontSize: '1.0625rem',
    color: '#fafafa',
    letterSpacing: '-0.01em',
  };

  const linksStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  };

  const actionsStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  };

  return (
    <nav
      style={navStyle}
      className={`cp-navbar ${className}`.trim()}
      {...rest}
    >
      <div style={brandStyle} className="cp-navbar__brand">
        {brand}
      </div>
      {links && (
        <div style={linksStyle} className="cp-navbar__links">
          {links}
        </div>
      )}
      <div style={actionsStyle} className="cp-navbar__actions">
        {actions}
      </div>
    </nav>
  );
};

Navbar.displayName = 'Navbar';
