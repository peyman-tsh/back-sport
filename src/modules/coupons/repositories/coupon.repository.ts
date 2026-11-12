import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseMongoRepository } from '../../../common/repositories/base-mongo.repository';
import { Coupon, CouponDocument } from '../schemas/coupon.schema';
import { ICouponRepository } from '../interfaces/coupon-repository.interface';

@Injectable()
export class CouponRepository
  extends BaseMongoRepository<Coupon, CouponDocument>
  implements ICouponRepository
{
  constructor(
    @InjectModel(Coupon.name)
    private readonly couponModel: Model<CouponDocument>,
  ) {
    super(couponModel);
  }

  async findByCode(code: string): Promise<Coupon | null> {
    return this.couponModel
      .findOne({ code: code.toUpperCase().trim(), isActive: true })
      .lean<Coupon>()
      .exec();
  }

  async incrementUsage(code: string): Promise<boolean> {
    return this.incrementUsageAtomic(code);
  }

  async incrementUsageAtomic(code: string): Promise<boolean> {
    const result = await this.couponModel
      .updateOne(
        {
          code: code.toUpperCase().trim(),
          isActive: true,
          $expr: { $lt: ['$usedCount', '$usageLimit'] },
          $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: null },
            { expiresAt: { $gt: new Date() } },
          ],
        },
        { $inc: { usedCount: 1 } },
      )
      .exec();
    return result.modifiedCount > 0;
  }
}
