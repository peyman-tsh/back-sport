import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { INJECTION_TOKENS } from '../../../common/constants/tokens';
import { ICouponRepository } from '../interfaces/coupon-repository.interface';
import { ValidateCouponDto } from '../dto/validate-coupon.dto';

export interface CouponValidationResult {
  isValid: boolean;
  code: string;
  discountAmount: number;
  finalAmount: number;
  message: string;
}

/**
 * Single Responsibility Principle (SRP):
 * CouponQueryService evaluates and validates coupon eligibility against cart totals.
 */
@Injectable()
export class CouponQueryService {
  constructor(
    @Inject(INJECTION_TOKENS.COUPON_REPOSITORY)
    private readonly couponRepository: ICouponRepository,
  ) {}

  async validateCoupon(dto: ValidateCouponDto): Promise<CouponValidationResult> {
    const coupon = await this.couponRepository.findByCode(dto.code);
    if (!coupon) {
      throw new NotFoundException('کد تخفیف وارد شده معتبر نمی‌باشد.');
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      throw new BadRequestException('مهلت استفاده از این کد تخفیف به پایان رسیده است.');
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException('سقف استفاده از این کد تخفیف تکمیل شده است.');
    }

    if (dto.orderAmount < coupon.minOrderAmount) {
      throw new BadRequestException(
        `حداقل مبلغ سفارش برای استفاده از این کد ${coupon.minOrderAmount.toLocaleString()} تومان می‌باشد.`,
      );
    }

    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = Math.round((dto.orderAmount * coupon.value) / 100);
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = coupon.value;
    }

    discountAmount = Math.min(discountAmount, dto.orderAmount);
    const finalAmount = Math.max(0, dto.orderAmount - discountAmount);

    return {
      isValid: true,
      code: coupon.code,
      discountAmount,
      finalAmount,
      message: `تخفیف به مبلغ ${discountAmount.toLocaleString()} تومان با موفقیت اعمال شد.`,
    };
  }

  async getAllCoupons() {
    return this.couponRepository.findAll({}, { limit: 50 });
  }
}
