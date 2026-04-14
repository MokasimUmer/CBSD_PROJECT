import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@creator-platform/db';
import { AuthService } from './auth.service';
import { AuthErrorCode, AuthConfig } from './auth.types';

/**
 * Auth Middleware
 *
 * Express middleware functions for request-level authentication
 * and role-based authorization.
 *
 * Design Pattern: MIDDLEWARE PATTERN
 *   These functions sit in the Express middleware chain.
 *   Each one either calls `next()` (allowing the request to
 *   proceed) or sends an error response.
 *
 * Usage (in apps/api):
 *   router.get('/protected', authMiddleware, handler);
 *   router.post('/admin-only', authMiddleware, roleGuard([UserRole.ADMIN]), handler);
 */

// ─── Module-scoped auth service singleton ────────────────────────────

let authServiceInstance: AuthService | null = null;

/**
 * Initialise the middleware layer with an AuthService instance.
 *
 * Call once at app startup (before any routes):
 *   initAuthMiddleware({ jwtSecret: process.env.JWT_SECRET! });
 */
export function initAuthMiddleware(config?: Partial<AuthConfig>): void {
  authServiceInstance = new AuthService(config);
}

/**
 * Get or lazily create the AuthService.
 */
function getAuthService(): AuthService {
  if (!authServiceInstance) {
    authServiceInstance = new AuthService();
  }
  return authServiceInstance;
}

// ─── authMiddleware ──────────────────────────────────────────────────

/**
 * Verify the JWT access token from the `Authorization: Bearer <token>` header.
 *
 * On success: attaches `req.user` (DecodedToken) and calls `next()`.
 * On failure: responds with 401.
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Authentication required. Provide a Bearer token.',
          code: AuthErrorCode.TOKEN_MISSING,
        },
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Authentication required. Provide a Bearer token.',
          code: AuthErrorCode.TOKEN_MISSING,
        },
      });
      return;
    }

    const decoded = getAuthService().verifyAccessToken(token);
    req.user = decoded;

    next();
  } catch (err: any) {
    const statusCode = err.statusCode || 401;
    const code = err.code || AuthErrorCode.TOKEN_INVALID;

    res.status(statusCode).json({
      success: false,
      error: {
        message: err.message || 'Authentication failed',
        code,
      },
    });
  }
}

// ─── roleGuard ───────────────────────────────────────────────────────

/**
 * Role-based access control middleware.
 *
 * Must be used **after** `authMiddleware` so that `req.user` exists.
 *
 * @param allowedRoles  Array of roles that are permitted to access the route.
 *
 * Usage:
 *   router.post('/admin', authMiddleware, roleGuard([UserRole.ADMIN]), handler);
 *   router.post('/create', authMiddleware, roleGuard([UserRole.CREATOR, UserRole.ADMIN]), handler);
 */
export function roleGuard(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // authMiddleware must run first
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Authentication required before role check',
          code: AuthErrorCode.TOKEN_MISSING,
        },
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: {
          message: `Access denied. Required role(s): ${allowedRoles.join(', ')}`,
          code: AuthErrorCode.INSUFFICIENT_ROLE,
        },
      });
      return;
    }

    next();
  };
}

// ─── optionalAuth ────────────────────────────────────────────────────

/**
 * Like `authMiddleware` but does **not** reject unauthenticated
 * requests.  If a valid Bearer token is present, `req.user` is
 * populated; otherwise the request proceeds without it.
 *
 * Useful for routes that behave differently for logged-in users
 * (e.g., personalised feed) but should still be publicly accessible.
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        req.user = getAuthService().verifyAccessToken(token);
      }
    }
  } catch {
    // Token invalid / expired — proceed without user context
    req.user = undefined;
  }
  next();
}
