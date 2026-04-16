/**
 * Constants
 *
 * Platform-wide constants used across multiple components.
 * Enum values are defined in packages/db (models), but
 * domain-level configuration and display mappings live here.
 *
 * Design Principle: REUSABILITY
 *   A single source of truth for values that appear in
 *   multiple packages — avoids magic strings/numbers.
 */

// ─── Subscription Tiers ──────────────────────────────────────────────

/** Human-readable labels for subscription tiers. */
export const TIER_LABELS: Record<string, string> = {
  basic: 'Basic',
  premium: 'Premium',
} as const;

/** Default monthly prices per tier (in USD cents). */
export const TIER_PRICES: Record<string, number> = {
  basic: 499,    // $4.99
  premium: 1499, // $14.99
} as const;

// ─── User Roles ──────────────────────────────────────────────────────

/** Human-readable labels for user roles. */
export const ROLE_LABELS: Record<string, string> = {
  fan: 'Fan',
  creator: 'Creator',
  admin: 'Admin',
} as const;

// ─── Notification Types ──────────────────────────────────────────────

/** Human-readable labels for notification types. */
export const NOTIFICATION_LABELS: Record<string, string> = {
  new_post: 'New Post',
  subscription_started: 'New Subscriber',
  subscription_cancelled: 'Subscription Cancelled',
  payment_received: 'Payment Received',
  payment_failed: 'Payment Failed',
  welcome: 'Welcome',
  system: 'System',
} as const;

// ─── Pagination ──────────────────────────────────────────────────────

/** Default pagination values used by list endpoints. */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// ─── Content ─────────────────────────────────────────────────────────

/** Maximum lengths for content fields. */
export const CONTENT_LIMITS = {
  TITLE_MAX_LENGTH: 200,
  BODY_MAX_LENGTH: 50_000,
  MEDIA_URLS_MAX_COUNT: 20,
  EXCERPT_LENGTH: 160,
} as const;

// ─── Auth ────────────────────────────────────────────────────────────

/** Auth-related numeric constants (non-secret). */
export const AUTH = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  DISPLAY_NAME_MIN: 2,
  DISPLAY_NAME_MAX: 50,
} as const;

// ─── HTTP Methods ────────────────────────────────────────────────────

/** Supported HTTP methods (for route registration helpers). */
export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;
export type HttpMethod = (typeof HTTP_METHODS)[number];

// ─── Date Ranges ─────────────────────────────────────────────────────

/** Time range presets (in milliseconds) for analytics / filtering. */
export const TIME_RANGES = {
  ONE_HOUR: 60 * 60 * 1_000,
  ONE_DAY: 24 * 60 * 60 * 1_000,
  ONE_WEEK: 7 * 24 * 60 * 60 * 1_000,
  ONE_MONTH: 30 * 24 * 60 * 60 * 1_000,
  ONE_YEAR: 365 * 24 * 60 * 60 * 1_000,
} as const;
