import { FilterQuery } from 'mongoose';
import {
  BaseRepository,
  PostModel,
  IPostDocument,
  PostTier,
  PostStatus,
  type PaginationOptions,
  type PaginatedResult,
} from '@creator-platform/db';

/**
 * Content Repository
 *
 * Extends BaseRepository with post-specific query methods.
 * Encapsulates all Post data access logic.
 *
 * Design Pattern: REPOSITORY PATTERN
 *   All database queries live here. The ContentService never
 *   touches Mongoose directly — it delegates to this repository.
 *
 * Why extend BaseRepository?
 *   BaseRepository provides generic CRUD (create, findById, update,
 *   delete, findPaginated). This class adds domain-specific queries
 *   like findByCreator, findByTier, and text search.
 */
export class ContentRepository extends BaseRepository<IPostDocument> {
  constructor() {
    super(PostModel);
  }

  // ─── Creator-specific queries ────────────────────────────────────

  /**
   * Find all posts by a specific creator with pagination.
   *
   * @param creatorId  The creator's user ID.
   * @param status     Filter by status (default: all statuses).
   * @param pagination Pagination options.
   */
  async findByCreator(
    creatorId: string,
    status?: PostStatus,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<IPostDocument>> {
    const filter: FilterQuery<IPostDocument> = { creatorId };
    if (status) {
      filter.status = status;
    }
    return this.findPaginated(filter, pagination);
  }

  /**
   * Find published posts by a creator, optionally filtered by tier.
   * Used for public-facing creator profile pages.
   */
  async findPublishedByCreator(
    creatorId: string,
    maxTier?: PostTier,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<IPostDocument>> {
    const filter: FilterQuery<IPostDocument> = {
      creatorId,
      status: PostStatus.PUBLISHED,
    };

    if (maxTier) {
      // Include posts at or below the given tier level
      const tierValues = this.getTiersAtOrBelow(maxTier);
      filter.tier = { $in: tierValues };
    }

    return this.findPaginated(filter, {
      ...pagination,
      sort: { publishedAt: -1 },
    });
  }

  // ─── Tier-based queries ──────────────────────────────────────────

  /**
   * Find all published posts at a specific tier.
   */
  async findByTier(
    tier: PostTier,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<IPostDocument>> {
    return this.findPaginated(
      { tier, status: PostStatus.PUBLISHED },
      { ...pagination, sort: { publishedAt: -1 } }
    );
  }

  /**
   * Find published posts accessible to a user's subscription tier.
   * A premium subscriber can see free + basic + premium content.
   */
  async findAccessiblePosts(
    maxTier: PostTier,
    creatorId?: string,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<IPostDocument>> {
    const tierValues = this.getTiersAtOrBelow(maxTier);
    const filter: FilterQuery<IPostDocument> = {
      status: PostStatus.PUBLISHED,
      tier: { $in: tierValues },
    };

    if (creatorId) {
      filter.creatorId = creatorId;
    }

    return this.findPaginated(filter, {
      ...pagination,
      sort: { publishedAt: -1 },
    });
  }

  // ─── Search ──────────────────────────────────────────────────────

  /**
   * Full-text search across post titles and tags.
   * Uses the MongoDB text index defined on the Post model.
   */
  async searchPosts(
    query: string,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<IPostDocument>> {
    return this.findPaginated(
      {
        $text: { $search: query },
        status: PostStatus.PUBLISHED,
      },
      { ...pagination, sort: { score: { $meta: 'textScore' } } as any }
    );
  }

  /**
   * Find published posts by tag.
   */
  async findByTag(
    tag: string,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<IPostDocument>> {
    return this.findPaginated(
      { tags: tag.toLowerCase(), status: PostStatus.PUBLISHED },
      { ...pagination, sort: { publishedAt: -1 } }
    );
  }

  // ─── Engagement ──────────────────────────────────────────────────

  /**
   * Atomically increment the view count of a post.
   */
  async incrementViewCount(postId: string): Promise<void> {
    await this.model.findByIdAndUpdate(postId, { $inc: { viewCount: 1 } }).exec();
  }

  /**
   * Atomically increment the like count of a post.
   */
  async incrementLikeCount(postId: string): Promise<void> {
    await this.model.findByIdAndUpdate(postId, { $inc: { likeCount: 1 } }).exec();
  }

  /**
   * Atomically decrement the like count of a post (minimum 0).
   */
  async decrementLikeCount(postId: string): Promise<void> {
    await this.model
      .findByIdAndUpdate(postId, { $inc: { likeCount: -1 } })
      .where('likeCount')
      .gt(0)
      .exec();
  }

  // ─── Statistics ──────────────────────────────────────────────────

  /**
   * Count published posts by a creator.
   */
  async countByCreator(creatorId: string): Promise<number> {
    return this.count({ creatorId, status: PostStatus.PUBLISHED });
  }

  /**
   * Get the most popular published posts (by view count).
   */
  async findPopular(limit: number = 10): Promise<IPostDocument[]> {
    return this.model
      .find({ status: PostStatus.PUBLISHED })
      .sort({ viewCount: -1 })
      .limit(limit)
      .exec();
  }

  /**
   * Get recently published posts across all creators.
   */
  async findRecent(limit: number = 10): Promise<IPostDocument[]> {
    return this.model
      .find({ status: PostStatus.PUBLISHED })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .exec();
  }

  // ─── Private helpers ─────────────────────────────────────────────

  /**
   * Returns all tier values at or below the given tier.
   *
   * Example: getTiersAtOrBelow(PostTier.BASIC) → ['free', 'basic']
   */
  private getTiersAtOrBelow(maxTier: PostTier): PostTier[] {
    const hierarchy: PostTier[] = [PostTier.FREE, PostTier.BASIC, PostTier.PREMIUM];
    const maxIndex = hierarchy.indexOf(maxTier);
    return hierarchy.slice(0, maxIndex + 1);
  }
}
