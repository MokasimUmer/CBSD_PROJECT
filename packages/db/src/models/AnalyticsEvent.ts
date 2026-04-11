import mongoose, { Schema, Document, Model, Types } from 'mongoose';

/**
 * Analytics Event Model
 *
 * Tracks user engagement events (views, likes, shares) for
 * creator analytics dashboards and reporting.
 *
 * Responsibility: Data persistence for analytics/engagement data.
 */

// ─── Types ───────────────────────────────────────────────────────────

export enum AnalyticsEventType {
  VIEW = 'view',
  LIKE = 'like',
  SHARE = 'share',
  COMMENT = 'comment',
  SUBSCRIBE = 'subscribe',
  UNSUBSCRIBE = 'unsubscribe',
  CLICK = 'click',
}

export interface IAnalyticsEvent {
  type: AnalyticsEventType;
  userId: Types.ObjectId;
  targetId: Types.ObjectId;
  targetType: 'post' | 'creator' | 'page';
  metadata?: Record<string, unknown>;
  sessionId?: string;
  createdAt: Date;
}

export interface IAnalyticsEventDocument extends IAnalyticsEvent, Document {}

// ─── Schema ──────────────────────────────────────────────────────────

const AnalyticsEventSchema = new Schema<IAnalyticsEventDocument>(
  {
    type: {
      type: String,
      enum: Object.values(AnalyticsEventType),
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    targetType: {
      type: String,
      enum: ['post', 'creator', 'page'],
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    sessionId: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // only createdAt, events are immutable
    toJSON: {
      transform(_doc: any, ret: any) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound indexes for aggregation queries
AnalyticsEventSchema.index({ targetId: 1, type: 1, createdAt: -1 });
AnalyticsEventSchema.index({ userId: 1, type: 1, createdAt: -1 });

// TTL: auto-delete raw events older than 1 year
AnalyticsEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

// ─── Model ───────────────────────────────────────────────────────────

export const AnalyticsEventModel: Model<IAnalyticsEventDocument> =
  mongoose.models.AnalyticsEvent ||
  mongoose.model<IAnalyticsEventDocument>('AnalyticsEvent', AnalyticsEventSchema);
