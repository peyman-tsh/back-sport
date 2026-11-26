import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
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

  async submitReview(
    dto: CreateReviewDto,
    user: { id: string; fullName: string },
  ): Promise<Review> {
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

    let review: Review;
    try {
      review = await this.reviewRepository.create({
        ...dto,
        userId: user.id,
        customerName: user.fullName,
        productId: targetProductId,
        cutOffLineScore: dto.cutOffLineScore || dto.rating,
        beamThrowScore: dto.beamThrowScore || dto.rating,
        fanNoiseScore: dto.fanNoiseScore || dto.rating,
        isVerifiedBuyer: false,
        isApproved: false,
      });
    } catch (error: any) {
      if (error?.code === 11000) {
        throw new ConflictException('You have already submitted a review for this product.');
      }
      throw error;
    }

    return review;
  }

  async approveReview(id: string): Promise<Review> {
    const review = await this.reviewRepository.approveReview(id);
    if (!review) {
      throw new NotFoundException('نظر یافت نشد.');
    }

    const stats = await this.reviewRepository.getProductReviewAggregation(review.productId);
    await this.productCommandService.updateReviewStats(
      review.productId,
      stats.averageRating,
      stats.totalReviews,
    );

    return review;
  }

  async deleteReview(id: string): Promise<boolean> {
    return this.reviewRepository.delete(id);
  }
}
