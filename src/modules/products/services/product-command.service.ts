import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { INJECTION_TOKENS } from '../../../common/constants/tokens';
import { IProductCatalogRepository } from '../interfaces/product-repository.interface';
import { Product } from '../schemas/product.schema';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { IProductChangeNotifier } from '../interfaces/product-change-notifier.interface';

@Injectable()
export class ProductCommandService {
  constructor(
    @Inject(INJECTION_TOKENS.PRODUCT_REPOSITORY)
    private readonly productRepository: IProductCatalogRepository,
    @Inject(INJECTION_TOKENS.PRODUCT_CHANGE_NOTIFIER)
    private readonly notifier: IProductChangeNotifier,
  ) {}

  async createProduct(dto: CreateProductDto): Promise<Product> {
    const slug = dto.slug.toLowerCase().trim();
    if (!slug) throw new BadRequestException('شناسه لاتین محصول الزامی است.');
    this.validateStock(dto.stock);
    if (await this.productRepository.exists({ slug })) {
      throw new ConflictException('شناسه لاتین محصول تکراری است.');
    }

    let created: Product;
    try {
      created = await this.productRepository.create({
        ...dto,
        slug,
        isAvailable: dto.stock > 0,
      });
    } catch (error: unknown) {
      this.rethrowDuplicateSlug(error);
    }
    this.notifier.notify(created.slug);
    return created;
  }

  async updateProduct(id: string, dto: UpdateProductDto): Promise<Product> {
    const existing = await this.productRepository.findById(id);
    if (!existing) throw new NotFoundException('محصول یافت نشد.');

    const slug = dto.slug?.toLowerCase().trim();
    if (slug === '') throw new BadRequestException('شناسه لاتین محصول الزامی است.');
    if (dto.stock !== undefined) this.validateStock(dto.stock);
    if (slug && slug !== existing.slug && await this.productRepository.exists({ slug })) {
      throw new ConflictException('شناسه لاتین محصول تکراری است.');
    }

    const changes: Partial<Product> = { ...dto };
    if (slug !== undefined) changes.slug = slug;
    if (dto.stock !== undefined || dto.isAvailable !== undefined) {
      changes.isAvailable = (dto.stock ?? existing.stock) > 0;
    }

    let updated: Product | null;
    try {
      updated = await this.productRepository.update(id, changes);
    } catch (error: unknown) {
      this.rethrowDuplicateSlug(error);
    }
    if (!updated) throw new NotFoundException('محصول یافت نشد.');
    this.notifier.notify(existing.slug, updated.slug);
    return updated;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const existing = await this.productRepository.findById(id);
    if (!existing || !await this.productRepository.delete(id)) {
      throw new NotFoundException('محصول یافت نشد.');
    }
    this.notifier.notify(existing.slug);
    return true;
  }

  async updateReviewStats(id: string, rating: number, reviewsCount: number): Promise<Product> {
    const updated = await this.productRepository.update(id, { rating, reviewsCount });
    if (!updated) throw new NotFoundException('محصول یافت نشد.');
    this.notifier.notify(updated.slug);
    return updated;
  }

  private validateStock(stock: number): void {
    if (!Number.isInteger(stock) || stock < 0) {
      throw new BadRequestException('موجودی باید عدد صحیح نامنفی باشد.');
    }
  }

  private rethrowDuplicateSlug(error: unknown): never {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
      throw new ConflictException('شناسه لاتین محصول تکراری است.');
    }
    throw error;
  }
}
