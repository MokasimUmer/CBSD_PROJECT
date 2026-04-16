import React from 'react';

/**
 * Avatar Component
 *
 * Displays a user's avatar image or a fallback with their initials.
 * Supports an online/offline status indicator.
 *
 * Design Pattern: COMPONENT PATTERN
 */

// ─── Types ───────────────────────────────────────────────────────────

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarStatus = 'online' | 'offline' | 'away' | 'none';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** URL of the avatar image. Falls back to initials when empty. */
  src?: string;
  /** User's display name (used for initials fallback and alt text). */
  name?: string;
  /** Size preset. */
  size?: AvatarSize;
  /** Status indicator dot. */
  status?: AvatarStatus;
}

// ─── Component ───────────────────────────────────────────────────────

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name = '',
  size = 'md',
  status = 'none',
  className = '',
  style,
  ...rest
}) => {
  const [imgError, setImgError] = React.useState(false);
  const initials = getInitials(name);
  const showImage = src && !imgError;
  const dim = avatarSizes[size];

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: dim,
    height: dim,
    borderRadius: '50%',
    overflow: 'hidden',
    flexShrink: 0,
    background: showImage ? 'transparent' : generateColor(name),
    color: '#ffffff',
    fontSize: `${dim * 0.38}px`,
    fontWeight: 600,
    letterSpacing: '0.025em',
    ...style,
  };

  const imgStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  };

  const statusDotSize = Math.max(8, dim * 0.22);
  const statusDotStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: statusDotSize,
    height: statusDotSize,
    borderRadius: '50%',
    border: '2px solid #1c1c1e',
    background: statusColors[status] || 'transparent',
  };

  return (
    <div
      style={containerStyle}
      className={`cp-avatar cp-avatar--${size} ${className}`.trim()}
      title={name}
      {...rest}
    >
      {showImage ? (
        <img
          src={src}
          alt={name || 'Avatar'}
          style={imgStyle}
          onError={() => setImgError(true)}
        />
      ) : (
        <span>{initials}</span>
      )}
      {status !== 'none' && <span style={statusDotStyle} />}
    </div>
  );
};

// ─── Helpers ─────────────────────────────────────────────────────────

const avatarSizes: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
};

const statusColors: Record<AvatarStatus, string> = {
  online: '#22c55e',
  offline: '#71717a',
  away: '#f59e0b',
  none: 'transparent',
};

function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Generate a deterministic background colour from a name. */
function generateColor(name: string): string {
  if (!name) return '#6366f1';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 55%, 45%)`;
}

Avatar.displayName = 'Avatar';
