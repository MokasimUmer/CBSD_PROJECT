import mongoose, { Schema, Document, Model, Types } from 'mongoose';

/**
 * Subscription Model
 *
 * Represents a fan's subscription to a creator at a specific tier.
 * Controls access to tier-locked content.
 *
 * Responsibility: Data persistence for subscription relationships.
 */

// ─── Types ───────────────────────────────────────────────────────────

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  PAUSED = 'paused',
}

export enum SubscriptionTier {
  BASIC = 'basic',
  PREMIUM = 'premium',
}

export interface ISubscription {
  userId: Types.ObjectId;
  creatorId: Types.ObjectId;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  priceAtPurchase: number;
  currency: string;
  startDate: Date;
  endDate: Date;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISubscriptionDocument extends ISubscription, Document {}

// ─── Schema ──────────────────────────────────────────────────────────

const SubscriptionSchema = new Schema<ISubscriptionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tier: {
      type: String,
      enum: Object.values(SubscriptionTier),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(SubscriptionStatus),
      default: SubscriptionStatus.ACTIVE,
    },
    priceAtPurchase: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    cancelledAt: {
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

// Unique constraint: one active subscription per user-creator pair
SubscriptionSchema.index(
  { userId: 1, creatorId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'active' } }
);

// ─── Model ───────────────────────────────────────────────────────────

export const SubscriptionModel: Model<ISubscriptionDocument> =
  mongoose.models.Subscription ||
  mongoose.model<ISubscriptionDocument>('Subscription', SubscriptionSchema);
