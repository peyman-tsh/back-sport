/**
 * Interface Segregation Principle (ISP):
 * Clients should not be forced to depend upon interfaces that they do not use.
 * Splitting read and write capabilities allows read-only query services
 * to depend only on IReadableRepository.
 */

export interface IPaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface IPaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface IReadableRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(filter?: Record<string, unknown>, options?: IPaginationOptions): Promise<IPaginatedResult<T>>;
  count(filter?: Record<string, unknown>): Promise<number>;
  exists(filter: Record<string, unknown>): Promise<boolean>;
}

export interface IWritableRepository<T> {
  create(item: Partial<T>): Promise<T>;
  update(id: string, item: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}

export interface IRepository<T> extends IReadableRepository<T>, IWritableRepository<T> {}
