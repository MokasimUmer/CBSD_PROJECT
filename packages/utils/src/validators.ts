/**
 * Validators
 *
 * Pure validation functions for common input types across the platform.
 * Each function returns a structured result so callers can surface
 * user-friendly error messages.
 *
 * Design Principle: REUSABILITY
 *   These validators are imported by auth, content, subscriptions, and
 *   the API layer — one source of truth for input rules.
 */

// ─── Types ───────────────────────────────────────────────────────────

/** Result of a validation check. */
export interface ValidationResult {
  /** Whether the input passed validation. */
  valid: boolean;
  /** Human-readable error messages (empty array when valid). */
  errors: string[];
}

// ─── Email ───────────────────────────────────────────────────────────

/**
 * Validate an email address.
 *
 * Checks:
 * - Non-empty
 * - Matches RFC 5322 simplified pattern
 * - Maximum 254 characters (RFC limit)
 */
export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];

  if (!email || typeof email !== 'string') {
    return { valid: false, errors: ['Email is required'] };
  }

  const trimmed = email.trim();

  if (trimmed.length === 0) {
    errors.push('Email is required');
  } else if (trimmed.length > 254) {
    errors.push('Email must not exceed 254 characters');
  } else {
    // Simplified RFC 5322 pattern
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      errors.push('Email format is invalid');
    }
  }

  return { valid: errors.length === 0, errors };
}

// ─── Password ────────────────────────────────────────────────────────

/** Password strength constraints. */
export interface PasswordConstraints {
  minLength?: number;
  maxLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireDigit?: boolean;
  requireSpecialChar?: boolean;
}

const DEFAULT_PASSWORD_CONSTRAINTS: Required<PasswordConstraints> = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireDigit: true,
  requireSpecialChar: false,
};

/**
 * Validate a password against configurable constraints.
 *
 * @param password   The raw password string
 * @param overrides  Optional constraint overrides
 */
export function validatePassword(
  password: string,
  overrides?: PasswordConstraints
): ValidationResult {
  const errors: string[] = [];
  const rules = { ...DEFAULT_PASSWORD_CONSTRAINTS, ...overrides };

  if (!password || typeof password !== 'string') {
    return { valid: false, errors: ['Password is required'] };
  }

  if (password.length < rules.minLength) {
    errors.push(`Password must be at least ${rules.minLength} characters`);
  }

  if (password.length > rules.maxLength) {
    errors.push(`Password must not exceed ${rules.maxLength} characters`);
  }

  if (rules.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (rules.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (rules.requireDigit && !/\d/.test(password)) {
    errors.push('Password must contain at least one digit');
  }

  if (rules.requireSpecialChar && !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return { valid: errors.length === 0, errors };
}

// ─── Display Name ────────────────────────────────────────────────────

/**
 * Validate a user display name.
 *
 * Checks:
 * - 2–50 characters
 * - Trimmed non-empty
 */
export function validateDisplayName(name: string): ValidationResult {
  const errors: string[] = [];

  if (!name || typeof name !== 'string') {
    return { valid: false, errors: ['Display name is required'] };
  }

  const trimmed = name.trim();

  if (trimmed.length < 2) {
    errors.push('Display name must be at least 2 characters');
  } else if (trimmed.length > 50) {
    errors.push('Display name must not exceed 50 characters');
  }

  return { valid: errors.length === 0, errors };
}

// ─── MongoDB ObjectId ────────────────────────────────────────────────

/**
 * Validate a MongoDB ObjectId string (24 hex characters).
 */
export function isValidObjectId(id: string): boolean {
  if (!id || typeof id !== 'string') return false;
  return /^[0-9a-fA-F]{24}$/.test(id);
}

// ─── URL ─────────────────────────────────────────────────────────────

/**
 * Validate a URL string.
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// ─── Generic ─────────────────────────────────────────────────────────

/**
 * Check that a required string field is present and non-empty.
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Check that a value is a positive number.
 */
export function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}
