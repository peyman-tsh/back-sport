import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CouponQueryService } from '../services/coupon-query.service';
import { CouponCommandService } from '../services/coupon-command.service';
import { CreateCouponDto } from '../dto/create-coupon.dto';
import { ValidateCouponDto } from '../dto/validate-coupon.dto';

@ApiTags('Coupons & Discounts (کدهای تخفیف)')
@Controller('coupons')
export class CouponController {
  constructor(
    private readonly queryService: CouponQueryService,
    private readonly commandService: CouponCommandService,
  ) {}

  @Post('validate')
  @ApiOperation({ summary: 'بررسی صحت و محاسبه مبلغ تخفیف سبد خرید' })
  @HttpCode(HttpStatus.OK)
  async validate(@Body() dto: ValidateCouponDto) {
    return this.queryService.validateCoupon(dto);
  }

  @Get()
  @ApiOperation({ summary: 'لیست کدهای تخفیف فعال (ادمین)' })
  async getAll() {
    return this.queryService.getAllCoupons();
  }

  @Post()
  @ApiOperation({ summary: 'ایجاد کد تخفیف جدید (ادمین)' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateCouponDto) {
    return this.commandService.createCoupon(dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف کد تخفیف' })
  async delete(@Param('id') id: string) {
    return this.commandService.deleteCoupon(id);
  }
}
