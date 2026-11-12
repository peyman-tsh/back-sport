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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { OrderQueryService } from '../services/order-query.service';
import { OrderCommandService } from '../services/order-command.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { FilterOrdersDto } from '../dto/filter-orders.dto';
import { OrderStatus } from '../schemas/order.schema';

@ApiTags('Orders & Checkout (سفارشات و پرداخت)')
@Controller('orders')
export class OrderController {
  constructor(
    private readonly queryService: OrderQueryService,
    private readonly commandService: OrderCommandService,
  ) {}

  @Post('checkout')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'ثبت سفارش و دریافت لینک درگاه پرداخت' })
  @HttpCode(HttpStatus.CREATED)
  async checkout(@Body() dto: CreateOrderDto) {
    return this.commandService.createOrderAndInitiatePayment(dto);
  }

  @Get('verify')
  @ApiOperation({ summary: 'تایید تراکنش پس از بازگشت از درگاه بانک' })
  async verify(
    @Query('authority') authority: string,
    @Query('status') status: string,
  ) {
    return this.commandService.verifyPayment(authority, status);
  }

  @Get('stats/financial')
  @ApiOperation({ summary: 'گزارش مالی و فروش کل فروشگاه (مخصوص پنل ادمین)' })
  async getFinancialStats() {
    return this.queryService.getFinancialReport();
  }

  @Get('customer/:phone')
  @ApiOperation({ summary: 'لیست سفارش‌های ثبت شده یک شماره موبایل' })
  async getCustomerOrders(@Param('phone') phone: string) {
    return this.queryService.getCustomerOrders(phone);
  }

  @Get()
  @ApiOperation({ summary: 'لیست سفارشات با فیلتر وضعیت و صفحه‌بندی' })
  async getOrders(@Query() filterDto: FilterOrdersDto) {
    return this.queryService.getFilteredOrders(filterDto);
  }

  @Get(':orderNumber')
  @ApiOperation({ summary: 'پیگیری وضعیت سفارش با شماره فاکتور' })
  async getOrder(@Param('orderNumber') orderNumber: string) {
    return this.queryService.getOrderByNumber(orderNumber);
  }

  @Patch(':orderNumber/status')
  @ApiOperation({ summary: 'به‌روزرسانی وضعیت ارسال سفارش (PROCESSING, SHIPPED, DELIVERED)' })
  async updateStatus(
    @Param('orderNumber') orderNumber: string,
    @Body('status') status: OrderStatus,
  ) {
    return this.commandService.updateOrderStatus(orderNumber, status);
  }
}
