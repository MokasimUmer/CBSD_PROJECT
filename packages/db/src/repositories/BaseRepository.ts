import { Model, Document, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';

/**
 * Base Repository (Generic)
 *
 * Implements the Repository Pattern to abstract all database
 * access behind a clean, type-safe interface.
 *
 * Design Pattern: REPOSITORY PATTERN
 *
 * Why? Separates data access logic from business logic.
 * Each component (Content, Subscriptions, etc.) extends this
 * base class with domain-specific queries, while generic CRUD
 * operations remain DRY.
 *
 * Usage:
 *   class UserRepository extends BaseRepository<IUserDocument> {
 *     constructor() { super(UserModel); }
 *     async findByEmail(email: string) { return this.findOne({ email }); }
 *   }
 */

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: Record<string, 1 | -1>;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export class BaseRepository<T extends Document> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  /**
   * Create a new document.
   */
  async create(data: Partial<T>): Promise<T> {
    const document = new this.model(data);
    return document.save();
  }

  /**
   * Find a document by its ID.
   */
  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  /**
   * Find a single document matching the filter.
   */
  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    return this.model.findOne(filter).exec();
  }

  /**
   * Find multiple documents matching the filter.
   */
  async findMany(
    filter: FilterQuery<T> = {},
    options?: QueryOptions
  ): Promise<T[]> {
    return this.model.find(filter, null, options).exec();
  }

  /**
   * Find documents with pagination support.
   */
  async findPaginated(
    filter: FilterQuery<T> = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResult<T>> {
    const {
      page = 1,
      limit = 20,
      sort = { createdAt: -1 },
    } = pagination;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.model.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  /**
   * Update a document by its ID.
   */
  async update(id: string, data: UpdateQuery<T>): Promise<T | null> {
    return this.model
      .findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .exec();
  }

  /**
   * Update multiple documents matching the filter.
   */
  async updateMany(
    filter: FilterQuery<T>,
    data: UpdateQuery<T>
  ): Promise<number> {
    const result = await this.model.updateMany(filter, data).exec();
    return result.modifiedCount;
  }

  /**
   * Delete a document by its ID.
   */
  async delete(id: string): Promise<T | null> {
    return this.model.findByIdAndDelete(id).exec();
  }

  /**
   * Delete multiple documents matching the filter.
   */
  async deleteMany(filter: FilterQuery<T>): Promise<number> {
    const result = await this.model.deleteMany(filter).exec();
    return result.deletedCount;
  }

  /**
   * Count documents matching the filter.
   */
  async count(filter: FilterQuery<T> = {}): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }

  /**
   * Check if a document matching the filter exists.
   */
  async exists(filter: FilterQuery<T>): Promise<boolean> {
    const result = await this.model.exists(filter);
    return result !== null;
  }
}
