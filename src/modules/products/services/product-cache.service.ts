import { Injectable } from '@nestjs/common';
import { IPaginatedResult } from '../../../common/interfaces/repository.interface';
import { Product } from '../schemas/product.schema';
import { IProductCache } from '../interfaces/product-cache.interface';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

@Injectable()
export class ProductCacheService implements IProductCache {
  private readonly slugCache = new Map<string, CacheEntry<Product>>();
  private readonly filterCache = new Map<string, CacheEntry<IPaginatedResult<Product>>>();
  private readonly ttlMs = 45_000;
  private readonly maxEntries = 500;
  private generation = 0;

  invalidate(): void {
    this.generation++;
    this.slugCache.clear();
    this.filterCache.clear();
  }

  getSlug(slug: string): Product | undefined {
    return this.get(this.slugCache, slug);
  }

  setSlug(slug: string, product: Product, generation = this.generation): void {
    this.set(this.slugCache, slug, product, generation);
  }

  getFiltered(key: string): IPaginatedResult<Product> | undefined {
    return this.get(this.filterCache, key);
  }

  setFiltered(key: string, result: IPaginatedResult<Product>, generation = this.generation): void {
    this.set(this.filterCache, key, result, generation);
  }

  currentGeneration(): number {
    return this.generation;
  }

  private get<T>(cache: Map<string, CacheEntry<T>>, key: string): T | undefined {
    const entry = cache.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt <= Date.now()) {
      cache.delete(key);
      return undefined;
    }
    return entry.value;
  }

  private set<T>(cache: Map<string, CacheEntry<T>>, key: string, value: T, generation: number): void {
    if (generation !== this.generation) return;
    if (cache.size >= this.maxEntries) {
      const oldestKey = cache.keys().next().value;
      if (oldestKey !== undefined) cache.delete(oldestKey);
    }
    cache.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }
}
