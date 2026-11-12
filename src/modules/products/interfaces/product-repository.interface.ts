import { IRepository, IPaginatedResult, IPaginationOptions } from '../../../common/interfaces/repository.interface';
import { Product, SocketType, SportCategory } from '../schemas/product.schema';

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

export interface IProductRepository extends IRepository<Product> {
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

  decrementStock(productId: string, quantity: number): Promise<boolean>;

  reserveStock(productId: string, quantity: number): Promise<boolean>;

  releaseReservedStock(productId: string, quantity: number): Promise<boolean>;

  finalizeReservedStock(productId: string, quantity: number): Promise<boolean>;

  updateStock(productId: string, newStock: number): Promise<Product | null>;
}
