import { IPaginatedResult } from '../../../common/interfaces/repository.interface';
import { Product } from '../schemas/product.schema';

export interface IProductCache {
  invalidate(): void;
  currentGeneration(): number;
  getSlug(slug: string): Product | undefined;
  setSlug(slug: string, product: Product, generation: number): void;
  getFiltered(key: string): IPaginatedResult<Product> | undefined;
  setFiltered(key: string, result: IPaginatedResult<Product>, generation: number): void;
}
