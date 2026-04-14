/**
 * @creator-platform/auth
 *
 * Authentication & authorization component for the Modular Creator Platform.
 *
 * This package provides:
 * - AuthService  — registration, login, token verification, refresh, logout
 * - Middleware   — authMiddleware, roleGuard, optionalAuth for Express
 * - Types        — DTOs, DecodedToken, AuthConfig, error codes
 *
 * Design Principles:
 * - Separation of Concerns: auth logic is self-contained; DB access is
 *   delegated to UserRepository (from packages/db)
 * - Loose Coupling: other packages never import bcrypt or jsonwebtoken;
 *   they depend on AuthService's public API
 * - Middleware Pattern: Express request pipeline extended with reusable
 *   authentication and authorization functions
 *
 * Design Patterns: SERVICE PATTERN, MIDDLEWARE PATTERN
 */

// ─── Service ─────────────────────────────────────────────────────────
export { AuthService } from './auth.service';

// ─── Middleware ──────────────────────────────────────────────────────
export {
  authMiddleware,
  roleGuard,
  optionalAuth,
  initAuthMiddleware,
} from './auth.middleware';

// ─── Types & Config ─────────────────────────────────────────────────
export {
  type RegisterDTO,
  type LoginDTO,
  type AuthResult,
  type DecodedToken,
  type DecodedRefreshToken,
  type AuthConfig,
  AuthErrorCode,
  DEFAULT_AUTH_CONFIG,
} from './auth.types';
