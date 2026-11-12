import { IRepository, IPaginatedResult, IPaginationOptions } from '../../../common/interfaces/repository.interface';
import { Review } from '../schemas/review.schema';

export interface IReviewAggregation {
  averageRating: number;
  totalReviews: number;
  averageCutOff: number;
  averageBeamThrow: number;
  averageFanNoise: number;
}

export interface IReviewRepository extends IRepository<Review> {
  findByProduct(
    productId: string | string[],
    options?: IPaginationOptions,
  ): Promise<IPaginatedResult<Review>>;

  getProductReviewAggregation(productId: string | string[]): Promise<IReviewAggregation>;

  approveReview(id: string): Promise<Review | null>;
}
