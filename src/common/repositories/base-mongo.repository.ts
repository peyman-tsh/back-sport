import { Model, Document, FilterQuery, UpdateQuery } from 'mongoose';
import { IRepository, IPaginatedResult, IPaginationOptions } from '../interfaces/repository.interface';

/**
 * Liskov Substitution Principle (LSP):
 * Base repository provides robust, interchangeable implementation of IRepository<T>.
 * Uses MongoDB `.lean()` for maximum performance (skipping Mongoose Document hydration overhead).
 */
export abstract class BaseMongoRepository<T, TDoc extends Document> implements IRepository<T> {
  constructor(protected readonly model: Model<TDoc>) {}

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).lean<T>().exec();
  }

  async findAll(
    filter: FilterQuery<TDoc> = {},
    options: IPaginationOptions = {},
  ): Promise<IPaginatedResult<T>> {
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(options.limit) || 12));
    const skip = (page - 1) * limit;

    const sortField = options.sortBy || 'createdAt';
    const sortDirection = options.sortOrder === 'asc' ? 1 : -1;
    const sort: Record<string, 1 | -1> = { [sortField]: sortDirection };

    const [data, total] = await Promise.all([
      this.model
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean<T[]>()
        .exec(),
      this.model.countDocuments(filter).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  async count(filter: FilterQuery<TDoc> = {}): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }

  async exists(filter: FilterQuery<TDoc>): Promise<boolean> {
    const count = await this.model.countDocuments(filter).limit(1).exec();
    return count > 0;
  }

  async create(item: Partial<T>): Promise<T> {
    const created = await this.model.create(item);
    return created.toObject() as unknown as T;
  }

  async update(id: string, item: Partial<T>): Promise<T | null> {
    return this.model
      .findByIdAndUpdate(id, item as UpdateQuery<TDoc>, { new: true, runValidators: true })
      .lean<T>()
      .exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return !!result;
  }
}
