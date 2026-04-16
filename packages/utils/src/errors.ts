/**
 * Error Utilities
 *
 * Provides a structured `AppError` class and a factory function for
 * creating consistent, typed errors across all platform components.
 *
 * Design Principle: HIGH COHESION
 *   All error-related utilities live here. Other packages import
 *   `AppError` instead of creating ad-hoc error objects with
 *   loosely attached properties.
 */

// ─── AppError ────────────────────────────────────────────────────────

/**
 * Structured application error with HTTP status code and error code.
 *
 * Replaces the pattern of doing:
 *   const error = new Error('...');
 *   (error as any).statusCode = 409;
 *   (error as any).code = 'SOME_CODE';
 *
 * Usage:
 *   throw new AppError('Email already exists', 409, 'AUTH_EMAIL_EXISTS');
 */
export class AppError extends Error {
  /** HTTP status code (e.g. 400, 401, 403, 404, 409, 500). */
  public readonly statusCode: number;

  /** Machine-readable error code for client-side branching. */
  public readonly code: string;

  /** Whether this error is operational (expected) vs. a programming bug. */
  public readonly isOperational: boolean;

  /** Optional payload for structured details (e.g. validation errors). */
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: Record<string, unknown>,
    isOperational: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.details = details;

    // Maintains proper stack trace in V8 (Node / Chrome)
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Serialise for JSON responses.
   */
  toJSON(): Record<string, unknown> {
    return {
      success: false,
      error: {
        message: this.message,
        code: this.code,
        ...(this.details ? { details: this.details } : {}),
      },
    };
  }
}

// ─── Factory helpers ─────────────────────────────────────────────────

/**
 * Shorthand factory for creating an AppError.
 *
 * @example
 *   throw createError(404, 'Post not found', 'POST_NOT_FOUND');
 */
export function createError(
  statusCode: number,
  message: string,
  code: string,
  details?: Record<string, unknown>
): AppError {
  return new AppError(message, statusCode, code, details);
}

/** 400 Bad Request */
export function badRequest(message: string, code: string = 'BAD_REQUEST', details?: Record<string, unknown>): AppError {
  return new AppError(message, 400, code, details);
}

/** 401 Unauthorized */
export function unauthorized(message: string = 'Authentication required', code: string = 'UNAUTHORIZED'): AppError {
  return new AppError(message, 401, code);
}

/** 403 Forbidden */
export function forbidden(message: string = 'Access denied', code: string = 'FORBIDDEN'): AppError {
  return new AppError(message, 403, code);
}

/** 404 Not Found */
export function notFound(resource: string = 'Resource', code: string = 'NOT_FOUND'): AppError {
  return new AppError(`${resource} not found`, 404, code);
}

/** 409 Conflict */
export function conflict(message: string, code: string = 'CONFLICT'): AppError {
  return new AppError(message, 409, code);
}

/** 500 Internal Server Error */
export function internalError(message: string = 'An unexpected error occurred'): AppError {
  return new AppError(message, 500, 'INTERNAL_ERROR', undefined, false);
}
