import { IRepository } from '../../../common/interfaces/repository.interface';
import { Coupon } from '../schemas/coupon.schema';

export interface ICouponRepository extends IRepository<Coupon> {
  findByCode(code: string): Promise<Coupon | null>;
  incrementUsage(code: string): Promise<boolean>;
  incrementUsageAtomic(code: string): Promise<boolean>;
}
