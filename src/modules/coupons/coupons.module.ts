import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Coupon, CouponSchema } from './schemas/coupon.schema';
import { CouponController } from './controllers/coupon.controller';
import { CouponQueryService } from './services/coupon-query.service';
import { CouponCommandService } from './services/coupon-command.service';
import { CouponRepository } from './repositories/coupon.repository';
import { INJECTION_TOKENS } from '../../common/constants/tokens';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Coupon.name, schema: CouponSchema }]),
  ],
  controllers: [CouponController],
  providers: [
    CouponQueryService,
    CouponCommandService,
    {
      provide: INJECTION_TOKENS.COUPON_REPOSITORY,
      useClass: CouponRepository,
    },
  ],
  exports: [CouponQueryService, CouponCommandService, INJECTION_TOKENS.COUPON_REPOSITORY],
})
export class CouponsModule {}
