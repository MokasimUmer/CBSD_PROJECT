import { BaseRepository } from './BaseRepository';
import { UserModel, IUserDocument } from '../models/User';

/**
 * User Repository
 *
 * Extends BaseRepository with user-specific query methods.
 * Encapsulates all User data access logic.
 */
export class UserRepository extends BaseRepository<IUserDocument> {
  constructor() {
    super(UserModel);
  }

  /**
   * Find a user by their email address.
   */
  async findByEmail(email: string): Promise<IUserDocument | null> {
    return this.findOne({ email: email.toLowerCase() });
  }

  /**
   * Find all creators on the platform.
   */
  async findCreators(): Promise<IUserDocument[]> {
    return this.findMany({ role: 'creator', isActive: true });
  }

  /**
   * Update a user's last login timestamp.
   */
  async updateLastLogin(userId: string): Promise<void> {
    await this.update(userId, { lastLoginAt: new Date() });
  }

  /**
   * Deactivate a user account (soft delete).
   */
  async deactivate(userId: string): Promise<IUserDocument | null> {
    return this.update(userId, { isActive: false });
  }
}
