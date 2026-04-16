/**
 * @creator-platform/utils
 *
 * Shared utility functions and constants for the Modular Creator Platform.
 *
 * This package provides:
 * - AppError — structured error class with HTTP status codes
 * - Validators — email, password, display name, ObjectId, URL
 * - Formatters — currency, date, text, numbers
 * - Constants — tier prices/labels, pagination defaults, content limits
 *
 * Design Principles:
 * - Reusability: every package can depend on utils for common logic
 * - Separation of Concerns: pure functions with zero side effects
 * - High Cohesion: validators together, formatters together, etc.
 *
 * Design Pattern: SERVICE PATTERN (stateless utility services)
 */

// ─── Errors ──────────────────────────────────────────────────────────
export {
  AppError,
  createError,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  internalError,
} from './errors';

// ─── Validators ──────────────────────────────────────────────────────
export {
  type ValidationResult,
  type PasswordConstraints,
  validateEmail,
  validatePassword,
  validateDisplayName,
  isValidObjectId,
  isValidUrl,
  isNonEmptyString,
  isPositiveNumber,
} from './validators';

// ─── Formatters ──────────────────────────────────────────────────────
export {
  type DateFormatPreset,
  formatCurrency,
  formatDate,
  formatRelativeTime,
  truncateText,
  slugify,
  formatCompactNumber,
  padNumber,
} from './formatters';

// ─── Constants ───────────────────────────────────────────────────────
export {
  TIER_LABELS,
  TIER_PRICES,
  ROLE_LABELS,
  NOTIFICATION_LABELS,
  PAGINATION,
  CONTENT_LIMITS,
  AUTH,
  HTTP_METHODS,
  type HttpMethod,
  TIME_RANGES,
} from './constants';
