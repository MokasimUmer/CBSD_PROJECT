import { SubscriptionTier } from '@creator-platform/db';

export interface SubscribeDTO {
  userId: string;
  creatorId: string;
  tier: SubscriptionTier;
  priceAtPurchase: number;
  currency?: string;
  durationMonths?: number; // e.g. 1 month
}

export interface CancelSubscriptionDTO {
  userId: string;
  creatorId: string;
}

export interface UpdateTierDTO {
  userId: string;
  creatorId: string;
  newTier: SubscriptionTier;
  newPrice: number;
}
