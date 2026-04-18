import { PostTier, PostStatus } from '@creator-platform/db';

/**
 * Content Types & Interfaces
 *
 * All type definitions for the content component.
 * Centralised here so that both the service and repository
 * can import the same shapes without circular dependencies.
 *
 * Design Pattern: SERVICE PATTERN + REPOSITORY PATTERN
 */

// ─── Request / Response DTOs ─────────────────────────────────────────

/** Data required to create a new post. */
export interface CreatePostDTO {
  title: string;
  body: string;
  tier?: PostTier;
  mediaUrls?: string[];
  tags?: string[];
  /** If true, publish immediately; otherwise save as draft. */
  publish?: boolean;
}

/** Data allowed when updating an existing post. */
export interface UpdatePostDTO {
  title?: string;
  body?: string;
  tier?: PostTier;
  status?: PostStatus;
  mediaUrls?: string[];
  tags?: string[];
}

/** Options for querying posts by a creator. */
export interface GetPostsOptions {
  /** Filter by post status (default: published). */
  status?: PostStatus;
  /** Filter by minimum tier. */
  tier?: PostTier;
  /** Filter by tag. */
  tag?: string;
  /** Search query (matches title and tags). */
  search?: string;
  /** Sort field (default: publishedAt). */
  sortBy?: 'publishedAt' | 'createdAt' | 'viewCount' | 'likeCount';
  /** Sort direction (default: desc). */
  sortOrder?: 'asc' | 'desc';
  /** Page number for pagination (default: 1). */
  page?: number;
  /** Items per page (default: 20). */
  limit?: number;
}

/** Lightweight post summary returned in list views. */
export interface PostSummary {
  id: string;
  title: string;
  excerpt: string;
  creatorId: string;
  tier: PostTier;
  status: PostStatus;
  tags: string[];
  viewCount: number;
  likeCount: number;
  publishedAt?: Date;
  createdAt: Date;
}

/** Full post detail including body and media. */
export interface PostDetail extends PostSummary {
  body: string;
  mediaUrls: string[];
  updatedAt: Date;
}

// ─── Access control ──────────────────────────────────────────────────

/**
 * The tier hierarchy for access validation.
 * A user with a higher-tier subscription can access lower-tier content.
 *
 *   free < basic < premium
 */
export const TIER_HIERARCHY: Record<PostTier, number> = {
  [PostTier.FREE]: 0,
  [PostTier.BASIC]: 1,
  [PostTier.PREMIUM]: 2,
};

// ─── Error codes ─────────────────────────────────────────────────────

/** Enumeration of content-specific error codes for consistent error handling. */
export enum ContentErrorCode {
  POST_NOT_FOUND = 'CONTENT_POST_NOT_FOUND',
  UNAUTHORIZED_CREATOR = 'CONTENT_UNAUTHORIZED_CREATOR',
  INSUFFICIENT_TIER = 'CONTENT_INSUFFICIENT_TIER',
  INVALID_STATUS_TRANSITION = 'CONTENT_INVALID_STATUS_TRANSITION',
  DUPLICATE_TITLE = 'CONTENT_DUPLICATE_TITLE',
}
