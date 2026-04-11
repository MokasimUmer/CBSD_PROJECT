/**
 * @creator-platform/db
 *
 * Database layer for the Modular Creator Platform.
 *
 * This package provides:
 * - MongoDB connection management (Singleton pattern)
 * - Mongoose models for all platform entities
 * - BaseRepository for generic CRUD (Repository pattern)
 * - UserRepository as a concrete example
 *
 * Design Principles:
 * - Separation of Concerns: only data access logic lives here
 * - Reusability: BaseRepository is extended by other packages
 * - High Cohesion: all DB-related code in one package
 *
 * Design Pattern: REPOSITORY PATTERN
 * - Abstracts database operations behind clean interfaces
 * - Business logic never touches Mongoose directly
 */

// ─── Connection ──────────────────────────────────────────────────────
export {
  connectDatabase,
  disconnectDatabase,
  isDatabaseConnected,
  type DatabaseConfig,
} from './connection';

// ─── Models ──────────────────────────────────────────────────────────
export { UserModel, UserRole, type IUser, type IUserDocument, type IUserProfile } from './models/User';
export { PostModel, PostTier, PostStatus, type IPost, type IPostDocument } from './models/Post';
export {
  SubscriptionModel,
  SubscriptionStatus,
  SubscriptionTier,
  type ISubscription,
  type ISubscriptionDocument,
} from './models/Subscription';
export {
  PaymentModel,
  PaymentStatus,
  PaymentProvider,
  type IPayment,
  type IPaymentDocument,
} from './models/Payment';
export {
  NotificationModel,
  NotificationType,
  type INotification,
  type INotificationDocument,
} from './models/Notification';
export {
  AnalyticsEventModel,
  AnalyticsEventType,
  type IAnalyticsEvent,
  type IAnalyticsEventDocument,
} from './models/AnalyticsEvent';

// ─── Repositories ────────────────────────────────────────────────────
export { BaseRepository, type PaginationOptions, type PaginatedResult } from './repositories/BaseRepository';
export { UserRepository } from './repositories/UserRepository';
