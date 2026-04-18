import {
  IPostDocument,
  PostTier,
  PostStatus,
  type PaginatedResult,
} from '@creator-platform/db';
import { ContentRepository } from './content.repository';
import {
  CreatePostDTO,
  UpdatePostDTO,
  GetPostsOptions,
  PostDetail,
  PostSummary,
  ContentErrorCode,
  TIER_HIERARCHY,
} from './content.types';

/**
 * Content Service
 *
 * Encapsulates all content/post business logic:
 * - Create, read, update, delete posts
 * - Tier-based access control (free < basic < premium)
 * - Media URL management
 * - Post publishing workflow (draft → published → archived)
 *
 * Design Pattern: SERVICE PATTERN
 *   Business logic lives here; data persistence is delegated to
 *   ContentRepository. This service never imports Mongoose directly.
 *
 * Design Pattern: REPOSITORY PATTERN
 *   ContentRepository (extending BaseRepository from packages/db)
 *   handles all database operations.
 *
 * Separation of Concerns:
 *   - content.types.ts  → DTOs, interfaces, error codes
 *   - content.repository.ts → data access (queries, mutations)
 *   - content.service.ts → business rules, validation, orchestration
 */
export class ContentService {
  private contentRepo: ContentRepository;

  constructor() {
    this.contentRepo = new ContentRepository();
  }

  // ─── Create ──────────────────────────────────────────────────────

  /**
   * Create a new post for a creator.
   *
   * Steps:
   *  1. Build the post document from the DTO
   *  2. Set status to PUBLISHED or DRAFT based on the `publish` flag
   *  3. If publishing, set publishedAt timestamp
   *  4. Persist via ContentRepository
   *  5. Return the full PostDetail
   *
   * @param creatorId  The ID of the creator authoring the post.
   * @param dto        The post data.
   */
  async createPost(creatorId: string, dto: CreatePostDTO): Promise<PostDetail> {
    const status = dto.publish ? PostStatus.PUBLISHED : PostStatus.DRAFT;

    const post = await this.contentRepo.create({
      title: dto.title.trim(),
      body: dto.body,
      creatorId: creatorId as any,
      tier: dto.tier || PostTier.FREE,
      status,
      mediaUrls: dto.mediaUrls || [],
      tags: (dto.tags || []).map((t) => t.toLowerCase().trim()),
      publishedAt: dto.publish ? new Date() : undefined,
    } as Partial<IPostDocument>);

    return this.toPostDetail(post);
  }

  // ─── Read ────────────────────────────────────────────────────────

  /**
   * Get a single post by ID.
   *
   * Access control logic:
   *  - If the requesting user is the creator, always return the post.
   *  - If the post is free-tier, always return it.
   *  - Otherwise, the caller must provide a `userTier` that is ≥ the post's tier.
   *
   * @param postId           The post ID.
   * @param requestingUserId The user requesting the post (optional).
   * @param userTier         The requesting user's subscription tier (optional).
   *
   * @throws Error with code CONTENT_POST_NOT_FOUND if the post doesn't exist.
   * @throws Error with code CONTENT_INSUFFICIENT_TIER if access is denied.
   */
  async getPostById(
    postId: string,
    requestingUserId?: string,
    userTier?: PostTier
  ): Promise<PostDetail> {
    const post = await this.contentRepo.findById(postId);

    if (!post) {
      const error = new Error('Post not found');
      (error as any).code = ContentErrorCode.POST_NOT_FOUND;
      (error as any).statusCode = 404;
      throw error;
    }

    // Creator can always see their own posts (including drafts)
    const isCreator = requestingUserId && post.creatorId.toString() === requestingUserId;

    if (!isCreator) {
      // Non-creators can only see published posts
      if (post.status !== PostStatus.PUBLISHED) {
        const error = new Error('Post not found');
        (error as any).code = ContentErrorCode.POST_NOT_FOUND;
        (error as any).statusCode = 404;
        throw error;
      }

      // Tier access check
      this.validateTierAccess(post.tier, userTier);
    }

    // Track view (fire-and-forget)
    if (!isCreator) {
      this.contentRepo.incrementViewCount(postId).catch(() => {
        /* non-critical — swallow errors */
      });
    }

    return this.toPostDetail(post);
  }

  /**
   * Get posts by a creator with filtering and pagination.
   *
   * @param creatorId The creator's user ID.
   * @param options   Filtering, sorting, and pagination options.
   */
  async getPostsByCreator(
    creatorId: string,
    options: GetPostsOptions = {}
  ): Promise<PaginatedResult<PostSummary>> {
    const {
      status = PostStatus.PUBLISHED,
      tier,
      tag,
      search,
      sortBy = 'publishedAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
    } = options;

    // Build pagination options
    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };

    // Use search if provided
    if (search) {
      const result = await this.contentRepo.searchPosts(search, { page, limit, sort });
      return this.toPaginatedSummary(result);
    }

    // Use tag filtering if provided
    if (tag) {
      const result = await this.contentRepo.findByTag(tag, { page, limit, sort });
      return this.toPaginatedSummary(result);
    }

    // Use tier filtering if provided
    if (tier) {
      const result = await this.contentRepo.findPublishedByCreator(creatorId, tier, {
        page,
        limit,
        sort,
      });
      return this.toPaginatedSummary(result);
    }

    // Default: filter by creator + status
    const result = await this.contentRepo.findByCreator(creatorId, status, {
      page,
      limit,
      sort,
    });
    return this.toPaginatedSummary(result);
  }

  /**
   * Get all posts accessible to a user based on their subscription tier.
   * Used for feed generation.
   *
   * @param userTier   The user's subscription tier.
   * @param creatorId  Optional: filter to a specific creator.
   * @param page       Page number (default: 1).
   * @param limit      Items per page (default: 20).
   */
  async getAccessiblePosts(
    userTier: PostTier = PostTier.FREE,
    creatorId?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResult<PostSummary>> {
    const result = await this.contentRepo.findAccessiblePosts(userTier, creatorId, {
      page,
      limit,
    });
    return this.toPaginatedSummary(result);
  }

  // ─── Update ──────────────────────────────────────────────────────

  /**
   * Update an existing post.
   *
   * Only the post's creator can edit it.
   *
   * @param postId    The post ID to update.
   * @param creatorId The requesting creator's user ID (for ownership check).
   * @param dto       The fields to update.
   *
   * @throws Error with code CONTENT_POST_NOT_FOUND if post doesn't exist.
   * @throws Error with code CONTENT_UNAUTHORIZED_CREATOR if not the owner.
   */
  async editPost(
    postId: string,
    creatorId: string,
    dto: UpdatePostDTO
  ): Promise<PostDetail> {
    const post = await this.contentRepo.findById(postId);

    if (!post) {
      const error = new Error('Post not found');
      (error as any).code = ContentErrorCode.POST_NOT_FOUND;
      (error as any).statusCode = 404;
      throw error;
    }

    // Ownership check
    if (post.creatorId.toString() !== creatorId) {
      const error = new Error('You can only edit your own posts');
      (error as any).code = ContentErrorCode.UNAUTHORIZED_CREATOR;
      (error as any).statusCode = 403;
      throw error;
    }

    // Validate status transitions
    if (dto.status) {
      this.validateStatusTransition(post.status, dto.status);
    }

    // Build update object
    const updateData: Record<string, any> = {};
    if (dto.title !== undefined) updateData.title = dto.title.trim();
    if (dto.body !== undefined) updateData.body = dto.body;
    if (dto.tier !== undefined) updateData.tier = dto.tier;
    if (dto.mediaUrls !== undefined) updateData.mediaUrls = dto.mediaUrls;
    if (dto.tags !== undefined) {
      updateData.tags = dto.tags.map((t) => t.toLowerCase().trim());
    }

    // Handle publishing
    if (dto.status === PostStatus.PUBLISHED && post.status !== PostStatus.PUBLISHED) {
      updateData.status = PostStatus.PUBLISHED;
      updateData.publishedAt = new Date();
    } else if (dto.status !== undefined) {
      updateData.status = dto.status;
    }

    const updated = await this.contentRepo.update(postId, updateData);

    if (!updated) {
      const error = new Error('Post not found');
      (error as any).code = ContentErrorCode.POST_NOT_FOUND;
      (error as any).statusCode = 404;
      throw error;
    }

    return this.toPostDetail(updated);
  }

  /**
   * Publish a draft post.
   * Convenience method that sets status to PUBLISHED and records publishedAt.
   */
  async publishPost(postId: string, creatorId: string): Promise<PostDetail> {
    return this.editPost(postId, creatorId, { status: PostStatus.PUBLISHED });
  }

  /**
   * Archive a post (soft-hide from public view).
   */
  async archivePost(postId: string, creatorId: string): Promise<PostDetail> {
    return this.editPost(postId, creatorId, { status: PostStatus.ARCHIVED });
  }

  // ─── Delete ──────────────────────────────────────────────────────

  /**
   * Delete a post permanently.
   * Only the post's creator can delete it.
   *
   * @throws Error with code CONTENT_POST_NOT_FOUND if post doesn't exist.
   * @throws Error with code CONTENT_UNAUTHORIZED_CREATOR if not the owner.
   */
  async deletePost(postId: string, creatorId: string): Promise<void> {
    const post = await this.contentRepo.findById(postId);

    if (!post) {
      const error = new Error('Post not found');
      (error as any).code = ContentErrorCode.POST_NOT_FOUND;
      (error as any).statusCode = 404;
      throw error;
    }

    if (post.creatorId.toString() !== creatorId) {
      const error = new Error('You can only delete your own posts');
      (error as any).code = ContentErrorCode.UNAUTHORIZED_CREATOR;
      (error as any).statusCode = 403;
      throw error;
    }

    await this.contentRepo.delete(postId);
  }

  // ─── Engagement ──────────────────────────────────────────────────

  /**
   * Like a post (increment like count).
   */
  async likePost(postId: string): Promise<void> {
    const exists = await this.contentRepo.exists({ _id: postId } as any);
    if (!exists) {
      const error = new Error('Post not found');
      (error as any).code = ContentErrorCode.POST_NOT_FOUND;
      (error as any).statusCode = 404;
      throw error;
    }
    await this.contentRepo.incrementLikeCount(postId);
  }

  /**
   * Unlike a post (decrement like count).
   */
  async unlikePost(postId: string): Promise<void> {
    const exists = await this.contentRepo.exists({ _id: postId } as any);
    if (!exists) {
      const error = new Error('Post not found');
      (error as any).code = ContentErrorCode.POST_NOT_FOUND;
      (error as any).statusCode = 404;
      throw error;
    }
    await this.contentRepo.decrementLikeCount(postId);
  }

  // ─── Statistics ──────────────────────────────────────────────────

  /**
   * Get post count for a creator.
   */
  async getCreatorPostCount(creatorId: string): Promise<number> {
    return this.contentRepo.countByCreator(creatorId);
  }

  /**
   * Get popular posts across the platform.
   */
  async getPopularPosts(limit: number = 10): Promise<PostSummary[]> {
    const posts = await this.contentRepo.findPopular(limit);
    return posts.map((p) => this.toPostSummary(p));
  }

  /**
   * Get recently published posts.
   */
  async getRecentPosts(limit: number = 10): Promise<PostSummary[]> {
    const posts = await this.contentRepo.findRecent(limit);
    return posts.map((p) => this.toPostSummary(p));
  }

  // ─── Private helpers ─────────────────────────────────────────────

  /**
   * Validate that a user's subscription tier can access a post's tier.
   *
   * Tier hierarchy: free (0) < basic (1) < premium (2)
   * Free content is always accessible even without a subscription.
   *
   * @throws Error with code CONTENT_INSUFFICIENT_TIER if access denied.
   */
  private validateTierAccess(postTier: PostTier, userTier?: PostTier): void {
    // Free content is always accessible
    if (postTier === PostTier.FREE) return;

    // If no tier provided, deny access to paid content
    if (!userTier) {
      const error = new Error(
        `This content requires a ${postTier} subscription or higher`
      );
      (error as any).code = ContentErrorCode.INSUFFICIENT_TIER;
      (error as any).statusCode = 403;
      throw error;
    }

    const postLevel = TIER_HIERARCHY[postTier];
    const userLevel = TIER_HIERARCHY[userTier];

    if (userLevel < postLevel) {
      const error = new Error(
        `This content requires a ${postTier} subscription or higher. Your current tier: ${userTier}`
      );
      (error as any).code = ContentErrorCode.INSUFFICIENT_TIER;
      (error as any).statusCode = 403;
      throw error;
    }
  }

  /**
   * Validate post status transitions.
   *
   * Allowed transitions:
   *   draft → published
   *   draft → archived
   *   published → archived
   *   archived → draft (re-draft for editing)
   *
   * @throws Error with code CONTENT_INVALID_STATUS_TRANSITION if transition is invalid.
   */
  private validateStatusTransition(current: PostStatus, target: PostStatus): void {
    if (current === target) return;

    const allowed: Record<PostStatus, PostStatus[]> = {
      [PostStatus.DRAFT]: [PostStatus.PUBLISHED, PostStatus.ARCHIVED],
      [PostStatus.PUBLISHED]: [PostStatus.ARCHIVED],
      [PostStatus.ARCHIVED]: [PostStatus.DRAFT],
    };

    if (!allowed[current]?.includes(target)) {
      const error = new Error(
        `Cannot transition post from '${current}' to '${target}'`
      );
      (error as any).code = ContentErrorCode.INVALID_STATUS_TRANSITION;
      (error as any).statusCode = 400;
      throw error;
    }
  }

  /**
   * Map an IPostDocument to PostDetail.
   */
  private toPostDetail(post: IPostDocument): PostDetail {
    return {
      id: post.id,
      title: post.title,
      body: post.body,
      excerpt: this.generateExcerpt(post.body),
      creatorId: post.creatorId.toString(),
      tier: post.tier,
      status: post.status,
      mediaUrls: post.mediaUrls,
      tags: post.tags,
      viewCount: post.viewCount,
      likeCount: post.likeCount,
      publishedAt: post.publishedAt,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }

  /**
   * Map an IPostDocument to PostSummary (lightweight, no body/media).
   */
  private toPostSummary(post: IPostDocument): PostSummary {
    return {
      id: post.id,
      title: post.title,
      excerpt: this.generateExcerpt(post.body),
      creatorId: post.creatorId.toString(),
      tier: post.tier,
      status: post.status,
      tags: post.tags,
      viewCount: post.viewCount,
      likeCount: post.likeCount,
      publishedAt: post.publishedAt,
      createdAt: post.createdAt,
    };
  }

  /**
   * Convert a PaginatedResult<IPostDocument> to PaginatedResult<PostSummary>.
   */
  private toPaginatedSummary(
    result: PaginatedResult<IPostDocument>
  ): PaginatedResult<PostSummary> {
    return {
      ...result,
      data: result.data.map((p) => this.toPostSummary(p)),
    };
  }

  /**
   * Generate a text excerpt from the post body.
   * Strips any markdown-like syntax and truncates to 200 chars.
   */
  private generateExcerpt(body: string, maxLength: number = 200): string {
    // Simple strip of markdown-like formatting
    const plain = body
      .replace(/#{1,6}\s/g, '')       // headings
      .replace(/[*_~`]/g, '')          // bold, italic, strikethrough, code
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links → text only
      .replace(/\n+/g, ' ')           // newlines → spaces
      .trim();

    if (plain.length <= maxLength) return plain;
    return plain.substring(0, maxLength).replace(/\s+\S*$/, '') + '…';
  }
}
