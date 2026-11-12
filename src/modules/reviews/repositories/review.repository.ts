import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseMongoRepository } from '../../../common/repositories/base-mongo.repository';
import { Review, ReviewDocument } from '../schemas/review.schema';
import {
  IReviewRepository,
  IReviewAggregation,
} from '../interfaces/review-repository.interface';
import { IPaginatedResult, IPaginationOptions } from '../../../common/interfaces/repository.interface';

@Injectable()
export class ReviewRepository
  extends BaseMongoRepository<Review, ReviewDocument>
  implements IReviewRepository
{
  constructor(
    @InjectModel(Review.name)
    private readonly reviewModel: Model<ReviewDocument>,
  ) {
    super(reviewModel);
  }

  async findByProduct(
    productId: string | string[],
    options: IPaginationOptions = {},
  ): Promise<IPaginatedResult<Review>> {
    const filter = Array.isArray(productId)
      ? { productId: { $in: productId }, isApproved: true }
      : { productId, isApproved: true };

    return this.findAll(
      filter,
      { ...options, sortBy: 'createdAt', sortOrder: 'desc' },
    );
  }

  async getProductReviewAggregation(productId: string | string[]): Promise<IReviewAggregation> {
    const match = Array.isArray(productId)
      ? { productId: { $in: productId }, isApproved: true }
      : { productId, isApproved: true };

    const [stats] = await this.reviewModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          total: { $sum: 1 },
          avgCutOff: { $avg: '$cutOffLineScore' },
          avgBeamThrow: { $avg: '$beamThrowScore' },
          avgFanNoise: { $avg: '$fanNoiseScore' },
        },
      },
    ]);

    return {
      averageRating: stats ? Number(stats.avgRating.toFixed(1)) : 5.0,
      totalReviews: stats?.total || 0,
      averageCutOff: stats ? Number(stats.avgCutOff.toFixed(1)) : 5.0,
      averageBeamThrow: stats ? Number(stats.avgBeamThrow.toFixed(1)) : 5.0,
      averageFanNoise: stats ? Number(stats.avgFanNoise.toFixed(1)) : 5.0,
    };
  }

  async approveReview(id: string): Promise<Review | null> {
    return this.reviewModel
      .findByIdAndUpdate(id, { isApproved: true }, { new: true })
      .lean<Review>()
      .exec();
  }
}
