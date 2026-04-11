import mongoose, { Schema, Document, Model, Types } from 'mongoose';

/**
 * Post Model
 *
 * Represents a piece of content published by a creator.
 * Posts can be tier-locked (free, basic, premium) to control access.
 *
 * Responsibility: Data persistence for creator content/posts.
 */

// ─── Types ───────────────────────────────────────────────────────────

export enum PostTier {
  FREE = 'free',
  BASIC = 'basic',
  PREMIUM = 'premium',
}

export enum PostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export interface IPost {
  title: string;
  body: string;
  creatorId: Types.ObjectId;
  tier: PostTier;
  status: PostStatus;
  mediaUrls: string[];
  tags: string[];
  viewCount: number;
  likeCount: number;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPostDocument extends IPost, Document {}

// ─── Schema ──────────────────────────────────────────────────────────

const PostSchema = new Schema<IPostDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 200,
    },
    body: {
      type: String,
      required: true,
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tier: {
      type: String,
      enum: Object.values(PostTier),
      default: PostTier.FREE,
    },
    status: {
      type: String,
      enum: Object.values(PostStatus),
      default: PostStatus.DRAFT,
    },
    mediaUrls: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    likeCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    publishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc: any, ret: any) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index for efficient creator content queries
PostSchema.index({ creatorId: 1, status: 1, publishedAt: -1 });

// Text index for search
PostSchema.index({ title: 'text', tags: 'text' });

// ─── Model ───────────────────────────────────────────────────────────

export const PostModel: Model<IPostDocument> =
  mongoose.models.Post || mongoose.model<IPostDocument>('Post', PostSchema);
