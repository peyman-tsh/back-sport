import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { INJECTION_TOKENS } from '../../../common/constants/tokens';
import {
  IProductQueryRepository,
  IProductFilterCriteria,
  IAvailableFilterSummary,
} from '../interfaces/product-repository.interface';
import { Product } from '../schemas/product.schema';
import { FilterProductsDto } from '../dto/filter-products.dto';
import { IPaginatedResult } from '../../../common/interfaces/repository.interface';
import { IProductCache } from '../interfaces/product-cache.interface';

@Injectable()
export class ProductQueryService {
  constructor(
    @Inject(INJECTION_TOKENS.PRODUCT_REPOSITORY)
    private readonly productRepository: IProductQueryRepository,
    @Inject(INJECTION_TOKENS.PRODUCT_CACHE)
    private readonly cache: IProductCache,
  ) {}

  async getFilteredProducts(dto: FilterProductsDto): Promise<IPaginatedResult<Product>> {
    const cacheKey = JSON.stringify({
      ...dto,
      page: dto.page || 1,
      limit: dto.limit || 12,
    });

    const cached = this.cache.getFiltered(cacheKey);
    if (cached) return cached;
    const generation = this.cache.currentGeneration();

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

    this.cache.setFiltered(cacheKey, result, generation);

    return result;
  }

  async getProductBySlug(slug: string): Promise<Product> {
    const normalizedSlug = slug.toLowerCase().trim();
    const cached = this.cache.getSlug(normalizedSlug);
    if (cached) return cached;
    const generation = this.cache.currentGeneration();

    const product = await this.productRepository.findBySlug(normalizedSlug);
    if (!product) {
      throw new NotFoundException(`محصولی با شناسه "${slug}" یافت نشد.`);
    }

    this.cache.setSlug(normalizedSlug, product, generation);

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
