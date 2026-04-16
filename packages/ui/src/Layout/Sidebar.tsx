import React from 'react';

/**
 * Sidebar Component
 *
 * Vertical side navigation with collapsible support.
 *
 * Design Pattern: COMPONENT PATTERN
 */

// ─── Types ───────────────────────────────────────────────────────────

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  /** Whether the sidebar is expanded or collapsed. */
  collapsed?: boolean;
  /** Width when expanded (default: '16rem'). */
  width?: string;
  /** Width when collapsed (default: '4rem'). */
  collapsedWidth?: string;
  /** Content at the top of the sidebar (e.g. logo). */
  header?: React.ReactNode;
  /** Content at the bottom of the sidebar (e.g. user info). */
  footer?: React.ReactNode;
}

// ─── Component ───────────────────────────────────────────────────────

export const Sidebar: React.FC<SidebarProps> = ({
  children,
  collapsed = false,
  width = '16rem',
  collapsedWidth = '4rem',
  header,
  footer,
  className = '',
  style,
  ...rest
}) => {
  const sidebarStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    width: collapsed ? collapsedWidth : width,
    minHeight: '100vh',
    background: '#0f0f11',
    borderRight: '1px solid #27272a',
    transition: 'width 0.25s ease',
    overflow: 'hidden',
    flexShrink: 0,
    ...style,
  };

  const headerStyle: React.CSSProperties = {
    padding: collapsed ? '1rem 0.75rem' : '1rem 1.25rem',
    borderBottom: '1px solid #1c1c1e',
    flexShrink: 0,
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    padding: collapsed ? '0.75rem 0.5rem' : '0.75rem 0.75rem',
    overflowY: 'auto',
    overflowX: 'hidden',
  };

  const footerStyle: React.CSSProperties = {
    padding: collapsed ? '0.75rem' : '1rem 1.25rem',
    borderTop: '1px solid #1c1c1e',
    flexShrink: 0,
  };

  return (
    <aside
      style={sidebarStyle}
      className={`cp-sidebar ${collapsed ? 'cp-sidebar--collapsed' : ''} ${className}`.trim()}
      {...rest}
    >
      {header && <div style={headerStyle} className="cp-sidebar__header">{header}</div>}
      <div style={contentStyle} className="cp-sidebar__content">{children}</div>
      {footer && <div style={footerStyle} className="cp-sidebar__footer">{footer}</div>}
    </aside>
  );
};

Sidebar.displayName = 'Sidebar';
