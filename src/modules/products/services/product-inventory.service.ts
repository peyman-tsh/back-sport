import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ClientSession } from 'mongoose';
import { INJECTION_TOKENS } from '../../../common/constants/tokens';
import { IProductInventoryRepository } from '../interfaces/product-repository.interface';
import { Product } from '../schemas/product.schema';
import { IProductChangeNotifier } from '../interfaces/product-change-notifier.interface';

@Injectable()
export class ProductInventoryService {
  private readonly logger = new Logger(ProductInventoryService.name);

  constructor(
    @Inject(INJECTION_TOKENS.PRODUCT_REPOSITORY)
    private readonly products: IProductInventoryRepository,
    @Inject(INJECTION_TOKENS.PRODUCT_CHANGE_NOTIFIER)
    private readonly notifier: IProductChangeNotifier,
  ) {}

  async deductStock(productId: string, quantity: number, session?: ClientSession): Promise<boolean> {
    this.requirePositiveQuantity(quantity);
    const success = await this.products.decrementStock(productId, quantity, session);
    if (!success) throw new BadRequestException('Insufficient stock.');
    if (!session) this.notifyStockChanges(productId);
    return true;
  }

  async reserveStock(productId: string, quantity: number): Promise<boolean> {
    this.requirePositiveQuantity(quantity);
    const reserved = await this.products.reserveStock(productId, quantity);
    if (reserved) this.notifyStockChanges(productId);
    return reserved;
  }

  async releaseReservedStock(productId: string, quantity: number, session?: ClientSession): Promise<boolean> {
    if (!Number.isInteger(quantity) || quantity <= 0) return false;
    const released = await this.products.releaseReservedStock(productId, quantity, session);
    if (released && !session) this.notifyStockChanges(productId);
    return released;
  }

  async finalizeReservedStock(productId: string, quantity: number, session?: ClientSession): Promise<boolean> {
    if (!Number.isInteger(quantity) || quantity <= 0) return false;
    const finalized = await this.products.finalizeReservedStock(productId, quantity, session);
    if (finalized && !session) this.notifyStockChanges(productId);
    return finalized;
  }

  async updateStock(productId: string, stock: number): Promise<Product> {
    if (!Number.isInteger(stock) || stock < 0) throw new BadRequestException('Stock must be a non-negative integer.');
    const product = await this.products.updateStock(productId, stock);
    if (!product) throw new NotFoundException('Product not found.');
    this.notifier.notify(product.slug);
    return product;
  }

  async adjustStock(productId: string, delta: number): Promise<Product> {
    if (!Number.isInteger(delta)) throw new BadRequestException('Stock adjustment must be an integer.');
    const product = await this.products.adjustStock(productId, delta);
    if (!product) throw new BadRequestException('Product not found or stock is insufficient.');
    this.notifier.notify(product.slug);
    return product;
  }

  notifyStockChanges(...productIds: string[]): void {
    this.notifier.notify();
    void Promise.all(productIds.map((id) => this.products.findById(id)))
      .then((products) => this.notifier.revalidateSlugs(...products.filter((p): p is Product => p !== null).map((p) => p.slug)))
      .catch((error: unknown) => this.logger.warn(`Could not revalidate product pages: ${error instanceof Error ? error.message : String(error)}`));
  }

  private requirePositiveQuantity(quantity: number): void {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new BadRequestException('Quantity must be a positive integer.');
    }
  }
}
