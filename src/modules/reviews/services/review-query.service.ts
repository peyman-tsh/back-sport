import { Injectable, Inject } from '@nestjs/common';
import { INJECTION_TOKENS } from '../../../common/constants/tokens';
import {
  IReviewRepository,
  IReviewAggregation,
} from '../interfaces/review-repository.interface';
import { Review } from '../schemas/review.schema';
import { IPaginatedResult } from '../../../common/interfaces/repository.interface';
import { ProductQueryService } from '../../products/services/product-query.service';

/**
 * Single Responsibility Principle (SRP):
 * ReviewQueryService handles reading reviews and photometric ratings.
 */
@Injectable()
export class ReviewQueryService {
  constructor(
    @Inject(INJECTION_TOKENS.REVIEW_REPOSITORY)
    private readonly reviewRepository: IReviewRepository,
    private readonly productQueryService: ProductQueryService,
  ) {}

  private async resolveProductIdentifiers(productIdOrSlug: string): Promise<string[]> {
    const ids = [productIdOrSlug];
    try {
      const product =
        (await this.productQueryService.getProductBySlug(productIdOrSlug).catch(() => null)) ||
        (await this.productQueryService.getProductById(productIdOrSlug).catch(() => null));
      if (product) {
        if (product.id && !ids.includes(product.id)) ids.push(product.id);
        if ((product as any)._id?.toString() && !ids.includes((product as any)._id.toString())) {
          ids.push((product as any)._id.toString());
        }
        if (product.slug && !ids.includes(product.slug)) ids.push(product.slug);
      }
    } catch {
      // fallback
    }
    return ids;
  }

  async getReviewsForProduct(
    productIdOrSlug: string,
    page = 1,
    limit = 10,
  ): Promise<IPaginatedResult<Review>> {
    const ids = await this.resolveProductIdentifiers(productIdOrSlug);
    return this.reviewRepository.findByProduct(ids, { page, limit });
  }

  async getProductRatingSummary(productIdOrSlug: string): Promise<IReviewAggregation> {
    const ids = await this.resolveProductIdentifiers(productIdOrSlug);
    return this.reviewRepository.getProductReviewAggregation(ids);
  }
}
