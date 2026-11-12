import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { INJECTION_TOKENS } from '../../../common/constants/tokens';
import { IReviewRepository } from '../interfaces/review-repository.interface';
import { CreateReviewDto } from '../dto/create-review.dto';
import { Review } from '../schemas/review.schema';
import { ProductCommandService } from '../../products/services/product-command.service';
import { ProductQueryService } from '../../products/services/product-query.service';

/**
 * Single Responsibility Principle (SRP):
 * ReviewCommandService handles posting reviews, moderation, and updating product ratings.
 */
@Injectable()
export class ReviewCommandService {
  constructor(
    @Inject(INJECTION_TOKENS.REVIEW_REPOSITORY)
    private readonly reviewRepository: IReviewRepository,
    private readonly productCommandService: ProductCommandService,
    private readonly productQueryService: ProductQueryService,
  ) {}

  async submitReview(dto: CreateReviewDto): Promise<Review> {
    let targetProductId = dto.productId;
    try {
      const product =
        (await this.productQueryService.getProductBySlug(dto.productId).catch(() => null)) ||
        (await this.productQueryService.getProductById(dto.productId).catch(() => null));
      if (product) {
        targetProductId = (product as any)._id?.toString() || product.id || dto.productId;
      }
    } catch {
      // fallback
    }

    const review = await this.reviewRepository.create({
      ...dto,
      productId: targetProductId,
      cutOffLineScore: dto.cutOffLineScore || dto.rating,
      beamThrowScore: dto.beamThrowScore || dto.rating,
      fanNoiseScore: dto.fanNoiseScore || dto.rating,
      isApproved: true, // Auto-approve for instant user feedback
    });

    // Recompute product rating & reviews count
    const stats = await this.reviewRepository.getProductReviewAggregation(targetProductId);
    await this.productCommandService.updateProduct(targetProductId, {
      rating: stats.averageRating,
      reviewsCount: stats.totalReviews,
    } as any).catch(() => null);

    return review;
  }

  async approveReview(id: string): Promise<Review> {
    const review = await this.reviewRepository.approveReview(id);
    if (!review) {
      throw new NotFoundException('نظر یافت نشد.');
    }

    const stats = await this.reviewRepository.getProductReviewAggregation(review.productId);
    await this.productCommandService.updateProduct(review.productId, {
      rating: stats.averageRating,
      reviewsCount: stats.totalReviews,
    } as any);

    return review;
  }

  async deleteReview(id: string): Promise<boolean> {
    return this.reviewRepository.delete(id);
  }
}
