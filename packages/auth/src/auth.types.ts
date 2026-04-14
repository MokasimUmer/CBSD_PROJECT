import { UserRole } from '@creator-platform/db';

/**
 * Auth Types & Interfaces
 *
 * All type definitions for the authentication component.
 * Centralised here so that both the service and middleware
 * can import the same shapes without circular dependencies.
 */

// ─── Request / Response DTOs ─────────────────────────────────────────

/** Data required to register a new user account. */
export interface RegisterDTO {
  email: string;
  password: string;
  displayName: string;
  role?: UserRole;
}

/** Data required to log in an existing user. */
export interface LoginDTO {
  email: string;
  password: string;
}

/** Data returned on successful authentication. */
export interface AuthResult {
  user: {
    id: string;
    email: string;
    role: UserRole;
    displayName: string;
  };
  accessToken: string;
  refreshToken: string;
}

/** Shape of the decoded JWT access-token payload. */
export interface DecodedToken {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

/** Shape of the decoded JWT refresh-token payload. */
export interface DecodedRefreshToken {
  userId: string;
  type: 'refresh';
  iat: number;
  exp: number;
}

// ─── Configuration ───────────────────────────────────────────────────

/** Auth module configuration. */
export interface AuthConfig {
  /** Secret used to sign JWTs. */
  jwtSecret: string;
  /** Secret used to sign refresh tokens (should differ from jwtSecret). */
  jwtRefreshSecret: string;
  /** Access-token lifetime (e.g. '15m', '1h'). */
  accessTokenExpiry: string;
  /** Refresh-token lifetime (e.g. '7d', '30d'). */
  refreshTokenExpiry: string;
  /** Number of bcrypt salt rounds (default: 12). */
  saltRounds: number;
}

/** Sensible defaults — **override jwtSecret in production**. */
export const DEFAULT_AUTH_CONFIG: AuthConfig = {
  jwtSecret: 'CHANGE_ME_IN_PRODUCTION',
  jwtRefreshSecret: 'CHANGE_ME_REFRESH_IN_PRODUCTION',
  accessTokenExpiry: '15m',
  refreshTokenExpiry: '7d',
  saltRounds: 12,
};

// ─── Express extension ──────────────────────────────────────────────

/**
 * Extend Express Request so that authMiddleware can attach the
 * decoded token to `req.user` without TypeScript complaining.
 */
declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}

// ─── Error codes ─────────────────────────────────────────────────────

/** Enumeration of auth-specific error codes for consistent error handling. */
export enum AuthErrorCode {
  EMAIL_ALREADY_EXISTS = 'AUTH_EMAIL_EXISTS',
  INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'AUTH_TOKEN_EXPIRED',
  TOKEN_INVALID = 'AUTH_TOKEN_INVALID',
  TOKEN_MISSING = 'AUTH_TOKEN_MISSING',
  ACCOUNT_DEACTIVATED = 'AUTH_ACCOUNT_DEACTIVATED',
  INSUFFICIENT_ROLE = 'AUTH_INSUFFICIENT_ROLE',
  REFRESH_TOKEN_INVALID = 'AUTH_REFRESH_TOKEN_INVALID',
}
