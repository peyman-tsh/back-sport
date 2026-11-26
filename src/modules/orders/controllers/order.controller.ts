import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { OrderQueryService } from '../services/order-query.service';
import { OrderCommandService } from '../services/order-command.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { FilterOrdersDto } from '../dto/filter-orders.dto';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@ApiTags('Orders & Checkout (سفارشات و پرداخت)')
@Controller('orders')
export class OrderController {
  constructor(
    private readonly queryService: OrderQueryService,
    private readonly commandService: OrderCommandService,
  ) {}

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'ثبت سفارش و دریافت لینک درگاه پرداخت' })
  @HttpCode(HttpStatus.CREATED)
  async checkout(@Body() dto: CreateOrderDto, @CurrentUser('id') userId: string) {
    return this.commandService.createOrderAndInitiatePayment(dto, userId);
  }

  @Get('verify')
  @ApiOperation({ summary: 'تایید تراکنش پس از بازگشت از درگاه بانک' })
  async verify(@Query() query: Record<string, string>) {
    const authority = query.authority || query.Authority;
    const status = (query.status || query.Status || '').toUpperCase();
    if (!authority || !status) {
      throw new BadRequestException('Missing payment callback parameters.');
    }
    return this.commandService.verifyPayment(authority, status);
  }

  @Get('stats/financial')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'گزارش مالی و فروش کل فروشگاه (مخصوص پنل ادمین)' })
  async getFinancialStats() {
    return this.queryService.getFinancialReport();
  }

  @Get('customer/:phone')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'لیست سفارش‌های ثبت شده یک شماره موبایل' })
  async getCustomerOrders(@Param('phone') phone: string) {
    return this.queryService.getCustomerOrders(phone);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'لیست سفارشات با فیلتر وضعیت و صفحه‌بندی' })
  async getOrders(@Query() filterDto: FilterOrdersDto) {
    return this.queryService.getFilteredOrders(filterDto);
  }

  @Get(':orderNumber')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'پیگیری وضعیت سفارش با شماره فاکتور' })
  async getOrder(@Param('orderNumber') orderNumber: string, @CurrentUser('id') userId: string) {
    return this.queryService.getOrderByNumberForUser(orderNumber, userId);
  }

  @Patch(':orderNumber/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'به‌روزرسانی وضعیت ارسال سفارش (PROCESSING, SHIPPED, DELIVERED)' })
  async updateStatus(
    @Param('orderNumber') orderNumber: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.commandService.updateOrderStatus(orderNumber, dto.status);
  }
}
