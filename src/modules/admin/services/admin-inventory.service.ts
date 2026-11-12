import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { INJECTION_TOKENS } from '../../../common/constants/tokens';
import { IProductRepository } from '../../products/interfaces/product-repository.interface';
import { Product } from '../../products/schemas/product.schema';
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
    private readonly productRepository: IProductRepository,
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
    if (newStock < 0) {
      throw new BadRequestException('موجودی انبار نمی‌تواند عدد منفی باشد.');
    }

    const updated = await this.productRepository.updateStock(productId, newStock);
    if (!updated) {
      throw new NotFoundException(`محصول با شناسه ${productId} در دیتابیس یافت نشد.`);
    }

    return updated;
  }

  async adjustProductStock(productId: string, delta: number): Promise<Product> {
    const existing = await this.productRepository.findById(productId);
    if (!existing) {
      throw new NotFoundException(`محصول یافت نشد.`);
    }

    const currentStock = existing.stock || 0;
    const finalStock = currentStock + delta;

    if (finalStock < 0) {
      throw new BadRequestException(
        `موجودی فعلی (${currentStock}) کمتر از مقدار کسری (${Math.abs(delta)}) است.`,
      );
    }

    return this.updateProductStock(productId, finalStock);
  }
}
