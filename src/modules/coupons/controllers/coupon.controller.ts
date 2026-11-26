import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CouponQueryService } from '../services/coupon-query.service';
import { CouponCommandService } from '../services/coupon-command.service';
import { CreateCouponDto } from '../dto/create-coupon.dto';
import { ValidateCouponDto } from '../dto/validate-coupon.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'لیست کدهای تخفیف فعال (ادمین)' })
  async getAll() {
    return this.queryService.getAllCoupons();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'ایجاد کد تخفیف جدید (ادمین)' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateCouponDto) {
    return this.commandService.createCoupon(dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'حذف کد تخفیف' })
  async delete(@Param('id') id: string) {
    return this.commandService.deleteCoupon(id);
  }
}
