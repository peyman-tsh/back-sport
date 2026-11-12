import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { INJECTION_TOKENS } from '../../../common/constants/tokens';
import { ICouponRepository } from '../interfaces/coupon-repository.interface';
import { CreateCouponDto } from '../dto/create-coupon.dto';
import { Coupon } from '../schemas/coupon.schema';

/**
 * Single Responsibility Principle (SRP):
 * CouponCommandService creates, modifies, and consumes coupons.
 */
@Injectable()
export class CouponCommandService {
  constructor(
    @Inject(INJECTION_TOKENS.COUPON_REPOSITORY)
    private readonly couponRepository: ICouponRepository,
  ) {}

  async createCoupon(dto: CreateCouponDto): Promise<Coupon> {
    const existing = await this.couponRepository.findByCode(dto.code);
    if (existing) {
      throw new ConflictException(`کد تخفیف "${dto.code}" قبلاً ایجاد شده است.`);
    }

    return this.couponRepository.create({
      ...dto,
      code: dto.code.toUpperCase().trim(),
      isActive: true,
      usedCount: 0,
    });
  }

  async markAsUsed(code: string): Promise<boolean> {
    const success = await this.couponRepository.incrementUsageAtomic(code);
    if (!success) {
      throw new ConflictException('سقف استفاده از این کد تخفیف تکمیل شده است یا منقضی گردیده است.');
    }
    return true;
  }

  async consumeCouponAtomic(code: string): Promise<boolean> {
    return this.couponRepository.incrementUsageAtomic(code);
  }

  async deleteCoupon(id: string): Promise<boolean> {
    return this.couponRepository.delete(id);
  }
}
