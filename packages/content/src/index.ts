/**
 * @creator-platform/content
 *
 * Content management component for the Modular Creator Platform.
 *
 * This package provides:
 * - ContentService    — create, read, update, delete posts
 * - ContentRepository — domain-specific data access for posts
 * - Types             — DTOs, interfaces, error codes, tier hierarchy
 *
 * Design Principles:
 * - Separation of Concerns: business logic (service) is separated from
 *   data access (repository) and type definitions (types)
 * - Loose Coupling: depends only on the exported API of packages/db;
 *   never imports Mongoose directly
 * - High Cohesion: all content-related code lives in this package
 *
 * Design Patterns: REPOSITORY PATTERN + SERVICE PATTERN
 *
 * Tier Access Control:
 *   Posts can be tier-locked (free, basic, premium).
 *   The ContentService enforces tier hierarchy:
 *     free (0) < basic (1) < premium (2)
 *   A premium subscriber can access all tiers.
 *   Free content is always publicly accessible.
 */

// ─── Service ─────────────────────────────────────────────────────────
export { ContentService } from './content.service';

// ─── Repository ──────────────────────────────────────────────────────
export { ContentRepository } from './content.repository';

// ─── Types & Config ─────────────────────────────────────────────────
export {
  type CreatePostDTO,
  type UpdatePostDTO,
  type GetPostsOptions,
  type PostSummary,
  type PostDetail,
  TIER_HIERARCHY,
  ContentErrorCode,
} from './content.types';
