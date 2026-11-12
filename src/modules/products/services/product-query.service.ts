import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { INJECTION_TOKENS } from '../../../common/constants/tokens';
import {
  IProductRepository,
  IProductFilterCriteria,
  IAvailableFilterSummary,
} from '../interfaces/product-repository.interface';
import { Product } from '../schemas/product.schema';
import { FilterProductsDto } from '../dto/filter-products.dto';
import { IPaginatedResult } from '../../../common/interfaces/repository.interface';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

@Injectable()
export class ProductQueryService {
  private readonly slugCache = new Map<string, CacheEntry<Product>>();
  private readonly filterCache = new Map<string, CacheEntry<IPaginatedResult<Product>>>();
  private readonly CACHE_TTL_MS = 45000; // 45 seconds TTL to protect database pool

  constructor(
    @Inject(INJECTION_TOKENS.PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  invalidateCache() {
    this.slugCache.clear();
    this.filterCache.clear();
  }

  async getFilteredProducts(dto: FilterProductsDto): Promise<IPaginatedResult<Product>> {
    const cacheKey = JSON.stringify({
      ...dto,
      page: dto.page || 1,
      limit: dto.limit || 12,
    });

    const cached = this.filterCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    const criteria: IProductFilterCriteria = {
      category: dto.category,
      socketType: dto.socketType,
      brand: dto.brand,
      material: dto.material,
      minPrice: dto.minPrice,
      maxPrice: dto.maxPrice,
      carMake: dto.carMake,
      carModel: dto.carModel,
      position: dto.position,
      minLumens: dto.minLumens,
      minWattage: dto.minWattage,
      colorTemperature: dto.colorTemperature,
      inStockOnly: dto.inStockOnly,
      search: dto.search,
    };

    const result = await this.productRepository.findFiltered(criteria, {
      page: dto.page,
      limit: dto.limit,
      sortBy: dto.sortBy,
      sortOrder: dto.sortOrder,
    });

    this.filterCache.set(cacheKey, {
      data: result,
      expiresAt: Date.now() + this.CACHE_TTL_MS,
    });

    return result;
  }

  async getProductBySlug(slug: string): Promise<Product> {
    const normalizedSlug = slug.toLowerCase().trim();
    const cached = this.slugCache.get(normalizedSlug);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    const product = await this.productRepository.findBySlug(normalizedSlug);
    if (!product) {
      throw new NotFoundException(`محصولی با شناسه "${slug}" یافت نشد.`);
    }

    this.slugCache.set(normalizedSlug, {
      data: product,
      expiresAt: Date.now() + this.CACHE_TTL_MS,
    });

    return product;
  }

  async getProductById(id: string): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`محصول با شناسه ${id} یافت نشد.`);
    }
    return product;
  }

  async getProductsByCar(
    carMake: string,
    carModel: string,
    position?: string,
  ): Promise<Product[]> {
    return this.productRepository.findByCarCompatibility(carMake, carModel, position);
  }

  async getFeaturedProducts(limit = 8): Promise<Product[]> {
    return this.productRepository.findFeatured(limit);
  }

  async searchFast(query: string, limit = 8): Promise<Product[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }
    return this.productRepository.searchFast(query.trim(), limit);
  }

  async getFilterFacets(): Promise<IAvailableFilterSummary> {
    return this.productRepository.getFilterFacetSummary();
  }
}
