import { SubscriptionStatus, SubscriptionTier } from '@creator-platform/db';
import { badRequest, notFound } from '@creator-platform/utils';
import { SubscriptionsRepository } from './subscriptions.repository';
import { SubscribeDTO, CancelSubscriptionDTO, UpdateTierDTO } from './subscriptions.types';

export class SubscriptionsService {
  private repository: SubscriptionsRepository;

  constructor(repository: SubscriptionsRepository = new SubscriptionsRepository()) {
    this.repository = repository;
  }

  /**
   * Subscribe a fan to a creator's tier.
   * Creates a new subscription or reactivates an old one.
   */
  async subscribe(dto: SubscribeDTO) {
    const existing = await this.repository.findByUserAndCreator(dto.userId, dto.creatorId);

    if (existing && existing.status === SubscriptionStatus.ACTIVE) {
      throw badRequest(
        'User already has an active subscription to this creator',
        'VALIDATION_ERROR'
      );
    }

    const durationMonths = dto.durationMonths || 1;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(startDate.getMonth() + durationMonths);

    if (existing) {
      // Reactivate or update existing subscription
      return this.repository.update(existing._id.toString(), {
        status: SubscriptionStatus.ACTIVE,
        tier: dto.tier,
        priceAtPurchase: dto.priceAtPurchase,
        currency: dto.currency || 'USD',
        startDate,
        endDate,
        cancelledAt: undefined,
      });
    }

    // Create new subscription
    return this.repository.create({
      userId: dto.userId as any,
      creatorId: dto.creatorId as any,
      tier: dto.tier,
      status: SubscriptionStatus.ACTIVE,
      priceAtPurchase: dto.priceAtPurchase,
      currency: dto.currency || 'USD',
      startDate,
      endDate,
    });
  }

  /**
   * Cancel an active subscription.
   */
  async cancelSubscription(dto: CancelSubscriptionDTO) {
    const subscription = await this.repository.findActiveByUserAndCreator(
      dto.userId,
      dto.creatorId
    );

    if (!subscription) {
      throw notFound('Active subscription', 'NOT_FOUND');
    }

    return this.repository.update(subscription._id.toString(), {
      status: SubscriptionStatus.CANCELLED,
      cancelledAt: new Date(),
    });
  }

  /**
   * Upgrade or downgrade a subscription tier.
   */
  async updateTier(dto: UpdateTierDTO) {
    const subscription = await this.repository.findActiveByUserAndCreator(
      dto.userId,
      dto.creatorId
    );

    if (!subscription) {
      throw notFound('Active subscription', 'NOT_FOUND');
    }

    if (subscription.tier === dto.newTier) {
      throw badRequest(
        'User is already subscribed to this tier',
        'VALIDATION_ERROR'
      );
    }

    return this.repository.update(subscription._id.toString(), {
      tier: dto.newTier,
      priceAtPurchase: dto.newPrice,
      // NOTE: Depending on billing logic, we might adjust endDate here.
    });
  }

  /**
   * Check if a user has access to a required tier for a given creator.
   * Free content doesn't require an active subscription.
   */
  async checkAccess(userId: string, creatorId: string, requiredTier: string): Promise<boolean> {
    if (requiredTier === 'free') {
      return true;
    }
    
    // In our DB model, posts can have 'free', 'basic', 'premium'.
    // Subscriptions have 'basic', 'premium'.

    const subscription = await this.repository.findActiveByUserAndCreator(userId, creatorId);

    if (!subscription) {
      return false;
    }

    // A premium subscriber can access both basic and premium content
    if (subscription.tier === SubscriptionTier.PREMIUM) {
      return true;
    }

    // A basic subscriber can only access basic (and free) content
    if (subscription.tier === SubscriptionTier.BASIC) {
      return requiredTier === 'basic';
    }

    return false;
  }

  /**
   * Get all active subscriptions for a fan.
   */
  async getUserSubscriptions(userId: string, page = 1, limit = 10) {
    return this.repository.findActiveSubscriptionsForUser(userId, { page, limit });
  }

  /**
   * Get all active subscribers for a creator.
   */
  async getCreatorSubscribers(creatorId: string, page = 1, limit = 10) {
    return this.repository.findActiveSubscribersForCreator(creatorId, { page, limit });
  }
}
