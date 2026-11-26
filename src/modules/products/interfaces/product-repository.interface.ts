import { IRepository, IReadableRepository, IPaginatedResult, IPaginationOptions } from '../../../common/interfaces/repository.interface';
import { Product, SocketType, SportCategory } from '../schemas/product.schema';
import { ClientSession } from 'mongoose';

export interface IProductFilterCriteria {
  category?: SportCategory;
  socketType?: SocketType;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  carMake?: string;
  carModel?: string;
  position?: string;
  minLumens?: number;
  minWattage?: number;
  colorTemperature?: number;
  material?: string;
  inStockOnly?: boolean;
  search?: string;
}

export interface IAvailableFilterSummary {
  categories: { category: string; count: number }[];
  brands: { brand: string; count: number }[];
  sockets: { socket: string; count: number }[];
  priceRange: { min: number; max: number };
}

export interface IProductQueryRepository extends Pick<IReadableRepository<Product>, 'findById' | 'findAll'> {
  findBySlug(slug: string): Promise<Product | null>;
  findFiltered(
    criteria: IProductFilterCriteria,
    options?: IPaginationOptions,
  ): Promise<IPaginatedResult<Product>>;

  findByCarCompatibility(
    carMake: string,
    carModel: string,
    position?: string,
  ): Promise<Product[]>;

  findFeatured(limit?: number): Promise<Product[]>;

  searchFast(keyword: string, limit?: number): Promise<Product[]>;

  getFilterFacetSummary(): Promise<IAvailableFilterSummary>;

}

export interface IProductCatalogRepository extends Pick<IRepository<Product>, 'findById' | 'exists' | 'create' | 'update' | 'delete'> {}

export interface IProductInventoryRepository {
  findById(id: string): Promise<Product | null>;
  decrementStock(productId: string, quantity: number, session?: ClientSession): Promise<boolean>;

  reserveStock(productId: string, quantity: number): Promise<boolean>;

  releaseReservedStock(productId: string, quantity: number, session?: ClientSession): Promise<boolean>;

  finalizeReservedStock(productId: string, quantity: number, session?: ClientSession): Promise<boolean>;

  updateStock(productId: string, newStock: number): Promise<Product | null>;
  adjustStock(productId: string, delta: number): Promise<Product | null>;
}

export interface IProductRepository extends IProductQueryRepository, IProductCatalogRepository, IProductInventoryRepository {}
