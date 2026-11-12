import { Product } from '../../products/schemas/product.schema';

export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export interface InventoryItemDto {
  id: string;
  title: string;
  slug: string;
  category: string;
  price: number;
  stock: number;
  isAvailable: boolean;
  salesCount: number;
  stockStatus: StockStatus;
  images: string[];
}

export interface InventoryOverviewResult {
  items: InventoryItemDto[];
  totalUnits: number;
  totalValuation: number;
  lowStockCount: number;
  outOfStockCount: number;
}

export interface IAdminInventoryService {
  getInventoryOverview(query?: {
    lowStockOnly?: boolean;
    outOfStockOnly?: boolean;
    search?: string;
  }): Promise<InventoryOverviewResult>;
  updateProductStock(productId: string, newStock: number): Promise<Product>;
  adjustProductStock(productId: string, delta: number): Promise<Product>;
}
