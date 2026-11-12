import {
  Injectable,
  Inject,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { INJECTION_TOKENS } from '../../../common/constants/tokens';
import { IProductRepository } from '../interfaces/product-repository.interface';
import { Product } from '../schemas/product.schema';
import { CreateProductDto } from '../dto/create-product.dto';
import { ProductQueryService } from './product-query.service';

/**
 * Single Responsibility Principle (SRP):
 * ProductCommandService is strictly responsible for mutating product state.
 */
@Injectable()
export class ProductCommandService {
  constructor(
    @Inject(INJECTION_TOKENS.PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    private readonly productQueryService: ProductQueryService,
  ) {}

  private async notifyFrontendRevalidation(slug?: string) {
    try {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const secret = process.env.REVALIDATE_SECRET || 'lumix-secret-revalidate-token-2026';
      await fetch(`${frontendUrl}/api/revalidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-revalidate-secret': secret,
        },
        body: JSON.stringify({ path: slug ? `/products/${slug}` : '/products' }),
      }).catch(() => null);
    } catch {
      // safe fallback
    }
  }

  async createProduct(dto: CreateProductDto): Promise<Product> {
    const slugExists = await this.productRepository.exists({ slug: dto.slug.toLowerCase().trim() });
    if (slugExists) {
      throw new ConflictException(`محصولی با این شناسه لاتین (slug) قبلاً ثبت شده است.`);
    }

    const created = await this.productRepository.create({
      ...dto,
      slug: dto.slug.toLowerCase().trim(),
      isAvailable: dto.stock > 0,
    });
    this.productQueryService.invalidateCache();
    this.notifyFrontendRevalidation(created.slug);
    return created;
  }

  async updateProduct(id: string, dto: Partial<CreateProductDto>): Promise<Product> {
    const existing = await this.productRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`محصول یافت نشد.`);
    }

    if (dto.slug && dto.slug !== existing.slug) {
      const slugExists = await this.productRepository.exists({ slug: dto.slug });
      if (slugExists) {
        throw new ConflictException(`شناسه لاتین (slug) تکراری است.`);
      }
    }

    const updated = await this.productRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException(`خطا در به‌روزرسانی محصول`);
    }
    this.productQueryService.invalidateCache();
    this.notifyFrontendRevalidation(updated.slug);
    return updated;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const existing = await this.productRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`محصول یافت نشد.`);
    }
    const deleted = await this.productRepository.delete(id);
    this.productQueryService.invalidateCache();
    this.notifyFrontendRevalidation(existing.slug);
    return deleted;
  }

  async deductStock(productId: string, quantity: number): Promise<boolean> {
    if (quantity <= 0) {
      throw new BadRequestException('تعداد نامعتبر است.');
    }

    const success = await this.productRepository.decrementStock(productId, quantity);
    if (!success) {
      throw new BadRequestException('موجودی انبار برای این کالا کافی نیست.');
    }
    return true;
  }

  async reserveStock(productId: string, quantity: number): Promise<boolean> {
    if (quantity <= 0) {
      throw new BadRequestException('تعداد درخواستی نامعتبر است.');
    }
    return this.productRepository.reserveStock(productId, quantity);
  }

  async releaseReservedStock(productId: string, quantity: number): Promise<boolean> {
    if (quantity <= 0) return false;
    return this.productRepository.releaseReservedStock(productId, quantity);
  }

  async finalizeReservedStock(productId: string, quantity: number): Promise<boolean> {
    if (quantity <= 0) return false;
    return this.productRepository.finalizeReservedStock(productId, quantity);
  }

  async updateStock(productId: string, stock: number): Promise<Product> {
    if (stock < 0) {
      throw new BadRequestException('تعداد موجودی انبار نمی‌تواند منفی باشد.');
    }
    const updated = await this.productRepository.updateStock(productId, stock);
    if (!updated) {
      throw new NotFoundException('محصول یافت نشد.');
    }
    this.productQueryService.invalidateCache();
    this.notifyFrontendRevalidation(updated.slug);
    return updated;
  }
}
