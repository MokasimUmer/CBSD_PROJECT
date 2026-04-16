/**
 * Formatters
 *
 * Pure formatting functions for displaying data consistently
 * across the platform (API responses, emails, frontend).
 *
 * Design Principle: REUSABILITY
 *   Formatting logic is centralised here instead of being
 *   duplicated in each package or the frontend.
 */

// ─── Currency ────────────────────────────────────────────────────────

/**
 * Format a numeric amount as a currency string.
 *
 * @param amount    The monetary amount (e.g. 9.99)
 * @param currency  ISO 4217 currency code (default: 'USD')
 * @param locale    BCP 47 locale string (default: 'en-US')
 *
 * @example
 *   formatCurrency(9.99)            // "$9.99"
 *   formatCurrency(1500, 'EUR', 'de-DE') // "1.500,00 €"
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// ─── Date / Time ─────────────────────────────────────────────────────

/** Pre-defined date format presets. */
export type DateFormatPreset = 'short' | 'medium' | 'long' | 'relative';

/**
 * Format a date using Intl or as a relative time string.
 *
 * @param date    Date object, ISO string, or timestamp
 * @param format  Preset format name (default: 'medium')
 * @param locale  BCP 47 locale string (default: 'en-US')
 *
 * @example
 *   formatDate(new Date(), 'short')     // "4/16/26"
 *   formatDate(new Date(), 'medium')    // "Apr 16, 2026"
 *   formatDate(new Date(), 'long')      // "April 16, 2026, 6:30 PM"
 *   formatDate(new Date(), 'relative')  // "just now"
 */
export function formatDate(
  date: Date | string | number,
  format: DateFormatPreset = 'medium',
  locale: string = 'en-US'
): string {
  const d = date instanceof Date ? date : new Date(date);

  if (isNaN(d.getTime())) return 'Invalid date';

  if (format === 'relative') {
    return formatRelativeTime(d);
  }

  const options: Intl.DateTimeFormatOptions =
    format === 'short'
      ? { year: '2-digit', month: 'numeric', day: 'numeric' }
      : format === 'medium'
        ? { year: 'numeric', month: 'short', day: 'numeric' }
        : {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          };

  return new Intl.DateTimeFormat(locale, options).format(d);
}

/**
 * Format a date as a human-friendly relative time string.
 *
 * @example
 *   formatRelativeTime(new Date(Date.now() - 30_000))    // "30 seconds ago"
 *   formatRelativeTime(new Date(Date.now() - 3_600_000)) // "1 hour ago"
 */
export function formatRelativeTime(date: Date): string {
  const now = Date.now();
  const diffMs = now - date.getTime();
  const absDiff = Math.abs(diffMs);
  const isFuture = diffMs < 0;

  const seconds = Math.floor(absDiff / 1_000);
  const minutes = Math.floor(absDiff / 60_000);
  const hours = Math.floor(absDiff / 3_600_000);
  const days = Math.floor(absDiff / 86_400_000);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  const suffix = isFuture ? 'from now' : 'ago';

  if (seconds < 10) return 'just now';
  if (seconds < 60) return `${seconds} seconds ${suffix}`;
  if (minutes === 1) return `1 minute ${suffix}`;
  if (minutes < 60) return `${minutes} minutes ${suffix}`;
  if (hours === 1) return `1 hour ${suffix}`;
  if (hours < 24) return `${hours} hours ${suffix}`;
  if (days === 1) return `1 day ${suffix}`;
  if (days < 7) return `${days} days ${suffix}`;
  if (weeks === 1) return `1 week ${suffix}`;
  if (weeks < 4) return `${weeks} weeks ${suffix}`;
  if (months === 1) return `1 month ${suffix}`;
  if (months < 12) return `${months} months ${suffix}`;
  if (years === 1) return `1 year ${suffix}`;
  return `${years} years ${suffix}`;
}

// ─── Text ────────────────────────────────────────────────────────────

/**
 * Truncate text to a maximum length, appending an ellipsis if trimmed.
 *
 * @param text       The string to truncate
 * @param maxLength  Maximum allowed length (default: 100)
 * @param suffix     Appended when truncated (default: '…')
 *
 * @example
 *   truncateText('Hello World', 5) // "Hello…"
 */
export function truncateText(
  text: string,
  maxLength: number = 100,
  suffix: string = '…'
): string {
  if (!text || text.length <= maxLength) return text || '';
  return text.slice(0, maxLength).trimEnd() + suffix;
}

/**
 * Convert a string to a URL-friendly slug.
 *
 * @example
 *   slugify('Hello World!')        // "hello-world"
 *   slugify('  My   Post Title  ') // "my-post-title"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')  // remove non-word chars (except spaces & hyphens)
    .replace(/[\s_]+/g, '-')   // spaces/underscores → hyphens
    .replace(/-+/g, '-')       // collapse consecutive hyphens
    .replace(/^-|-$/g, '');    // trim leading/trailing hyphens
}

// ─── Numbers ─────────────────────────────────────────────────────────

/**
 * Format a number with compact notation for large values.
 *
 * @example
 *   formatCompactNumber(1_234)       // "1.2K"
 *   formatCompactNumber(1_500_000)   // "1.5M"
 */
export function formatCompactNumber(value: number, locale: string = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Pad a number with leading zeroes.
 *
 * @example
 *   padNumber(5, 3) // "005"
 */
export function padNumber(value: number, length: number = 2): string {
  return String(value).padStart(length, '0');
}
