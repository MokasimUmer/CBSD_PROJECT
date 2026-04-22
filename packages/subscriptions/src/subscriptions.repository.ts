import { FilterQuery } from 'mongoose';
import {
  BaseRepository,
  SubscriptionModel,
  ISubscriptionDocument,
  SubscriptionStatus,
  type PaginationOptions,
  type PaginatedResult,
} from '@creator-platform/db';

export class SubscriptionsRepository extends BaseRepository<ISubscriptionDocument> {
  constructor() {
    super(SubscriptionModel);
  }

  /**
   * Find an active subscription for a specific user to a creator.
   */
  async findActiveByUserAndCreator(
    userId: string,
    creatorId: string
  ): Promise<ISubscriptionDocument | null> {
    return this.findOne({
      userId,
      creatorId,
      status: SubscriptionStatus.ACTIVE,
    });
  }

  /**
   * Find a subscription for a user and creator regardless of status.
   */
  async findByUserAndCreator(
    userId: string,
    creatorId: string
  ): Promise<ISubscriptionDocument | null> {
    return this.findOne({ userId, creatorId });
  }

  /**
   * Get all active subscriptions for a given fan (user).
   */
  async findActiveSubscriptionsForUser(
    userId: string,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<ISubscriptionDocument>> {
    return this.findPaginated(
      { userId, status: SubscriptionStatus.ACTIVE },
      { ...pagination, sort: { createdAt: -1 } }
    );
  }

  /**
   * Get all active subscribers for a given creator.
   */
  async findActiveSubscribersForCreator(
    creatorId: string,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<ISubscriptionDocument>> {
    return this.findPaginated(
      { creatorId, status: SubscriptionStatus.ACTIVE },
      { ...pagination, sort: { createdAt: -1 } }
    );
  }

  /**
   * Count the number of active subscribers for a creator.
   */
  async countActiveSubscribers(creatorId: string): Promise<number> {
    return this.count({ creatorId, status: SubscriptionStatus.ACTIVE });
  }
}
