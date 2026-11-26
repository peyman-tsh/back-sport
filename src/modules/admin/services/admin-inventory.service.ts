import { Injectable, Inject } from '@nestjs/common';
import { INJECTION_TOKENS } from '../../../common/constants/tokens';
import { IProductQueryRepository } from '../../products/interfaces/product-repository.interface';
import { Product } from '../../products/schemas/product.schema';
import { ProductInventoryService } from '../../products/services/product-inventory.service';
import {
  IAdminInventoryService,
  InventoryOverviewResult,
  InventoryItemDto,
  StockStatus,
} from '../interfaces/admin-inventory.interface';

/**
 * Single Responsibility Principle (SRP):
 * AdminInventoryService is purely responsible for stock level adjustments, warehouse tracking,
 * and inventory valuation.
 */
@Injectable()
export class AdminInventoryService implements IAdminInventoryService {
  constructor(
    @Inject(INJECTION_TOKENS.PRODUCT_REPOSITORY)
    private readonly productRepository: IProductQueryRepository,
    private readonly inventory: ProductInventoryService,
  ) {}

  async getInventoryOverview(query: {
    lowStockOnly?: boolean;
    outOfStockOnly?: boolean;
    search?: string;
  } = {}): Promise<InventoryOverviewResult> {
    const paginated = await this.productRepository.findAll({}, { page: 1, limit: 1000 });
    const allProducts = paginated.data;

    let totalUnits = 0;
    let totalValuation = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    const items: InventoryItemDto[] = [];

    for (const p of allProducts) {
      const stock = p.stock || 0;
      totalUnits += stock;
      totalValuation += stock * (p.price || 0);

      let stockStatus: StockStatus = 'IN_STOCK';
      if (stock === 0) {
        stockStatus = 'OUT_OF_STOCK';
        outOfStockCount++;
      } else if (stock <= 5) {
        stockStatus = 'LOW_STOCK';
        lowStockCount++;
      }

      // Check filters
      if (query.lowStockOnly && stockStatus !== 'LOW_STOCK') {
        continue;
      }
      if (query.outOfStockOnly && stockStatus !== 'OUT_OF_STOCK') {
        continue;
      }
      if (query.search && query.search.trim().length > 0) {
        const q = query.search.toLowerCase();
        const matches =
          p.title.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q);
        if (!matches) continue;
      }

      items.push({
        id: p.id || (p as any)._id?.toString(),
        title: p.title,
        slug: p.slug,
        category: p.category,
        price: p.price,
        stock,
        isAvailable: stock > 0,
        salesCount: p.salesCount || 0,
        stockStatus,
        images: p.images || [],
      });
    }

    return {
      items,
      totalUnits,
      totalValuation,
      lowStockCount,
      outOfStockCount,
    };
  }

  async updateProductStock(productId: string, newStock: number): Promise<Product> {
    return this.inventory.updateStock(productId, newStock);
  }

  async adjustProductStock(productId: string, delta: number): Promise<Product> {
    return this.inventory.adjustStock(productId, delta);
  }
}
