import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Inject,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { INJECTION_TOKENS } from '../../../common/constants/tokens';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { IAdminDashboardService } from '../interfaces/admin-dashboard.interface';
import { IAdminInventoryService } from '../interfaces/admin-inventory.interface';
import { UpdateStockDto } from '../dto/update-stock.dto';
import { AdjustStockDto } from '../dto/adjust-stock.dto';
import { OrderQueryService } from '../../orders/services/order-query.service';
import { OrderCommandService } from '../../orders/services/order-command.service';
import { FilterOrdersDto } from '../../orders/dto/filter-orders.dto';
import { OrderStatus } from '../../orders/schemas/order.schema';
import { UserQueryService } from '../../users/services/user-query.service';
import { ProductCommandService } from '../../products/services/product-command.service';
import { UpdateProductDto } from '../../products/dto/update-product.dto';
import { CreateProductDto } from '../../products/dto/create-product.dto';

/**
 * Single Responsibility Principle (SRP):
 * AdminController handles exclusively admin HTTP routing, authentication/role gating,
 * input validation, and delegation to domain services.
 *
 * Security:
 * Strictly guarded by JwtAuthGuard + RolesGuard ('ADMIN').
 */
@ApiTags('Admin Panel & Warehouse (مدیریت فروشگاه و انبارداری)')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
export class AdminController {
  constructor(
    @Inject(INJECTION_TOKENS.ADMIN_DASHBOARD_SERVICE)
    private readonly dashboardService: IAdminDashboardService,
    @Inject(INJECTION_TOKENS.ADMIN_INVENTORY_SERVICE)
    private readonly inventoryService: IAdminInventoryService,
    private readonly orderQueryService: OrderQueryService,
    private readonly orderCommandService: OrderCommandService,
    private readonly userQueryService: UserQueryService,
    private readonly productCommandService: ProductCommandService,
  ) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'دریافت آمار جامع داشبورد مدیریت، فروش و هشدارهای انبار' })
  @ApiResponse({ status: 200, description: 'داده‌های داشبورد ادمین بازگردانده شد.' })
  async getDashboardSummary() {
    return this.dashboardService.getDashboardSummary();
  }

  // --- Inventory & Stock Management ---

  @Get('inventory')
  @ApiOperation({ summary: 'لیست کامل موجودی انبار تمام کالاها به همراه فیلتر کالاهای رو به اتمام' })
  async getInventory(
    @Query('lowStockOnly') lowStockOnly?: boolean,
    @Query('outOfStockOnly') outOfStockOnly?: boolean,
    @Query('search') search?: string,
  ) {
    return this.inventoryService.getInventoryOverview({
      lowStockOnly: lowStockOnly === true || String(lowStockOnly) === 'true',
      outOfStockOnly: outOfStockOnly === true || String(outOfStockOnly) === 'true',
      search,
    });
  }

  @Patch('inventory/:productId/stock')
  @ApiOperation({ summary: 'تنظیم مستقیم موجودی کالا در انبار' })
  async updateStock(
    @Param('productId') productId: string,
    @Body() dto: UpdateStockDto,
  ) {
    return this.inventoryService.updateProductStock(productId, dto.stock);
  }

  @Patch('inventory/:productId/adjust')
  @ApiOperation({ summary: 'افزایش یا کاهش موجودی کالا با مقدار دلتا' })
  async adjustStock(
    @Param('productId') productId: string,
    @Body() dto: AdjustStockDto,
  ) {
    return this.inventoryService.adjustProductStock(productId, dto.delta);
  }

  // --- Order Management ---

  @Get('orders')
  @ApiOperation({ summary: 'مشاهده لیست تمام سفارش‌های فروشگاه با فیلتر وضعیت' })
  async getOrders(@Query() filterDto: FilterOrdersDto) {
    return this.orderQueryService.getFilteredOrders(filterDto);
  }

  @Patch('orders/:orderNumber/status')
  @ApiOperation({ summary: 'تغییر وضعیت سفارش (آماده‌سازی، ارسال شده، تحویل داده شده)' })
  async updateOrderStatus(
    @Param('orderNumber') orderNumber: string,
    @Body('status') status: OrderStatus,
  ) {
    return this.orderCommandService.updateOrderStatus(orderNumber, status);
  }

  // --- User Management ---

  @Get('users')
  @ApiOperation({ summary: 'مشاهده لیست کاربران و مشتریان' })
  async getUsers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.userQueryService.getAllUsers(Number(page) || 1, Number(limit) || 20);
  }

  // --- Product Catalog Management ---

  @Post('products')
  @ApiOperation({ summary: 'افزودن قطعه اسپرت جدید به فروشگاه' })
  @HttpCode(HttpStatus.CREATED)
  async createProduct(@Body() dto: CreateProductDto) {
    return this.productCommandService.createProduct(dto);
  }

  @Put('products/:id')
  @ApiOperation({ summary: 'ویرایش مشخصات کالا' })
  async updateProduct(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productCommandService.updateProduct(id, dto);
  }

  @Delete('products/:id')
  @ApiOperation({ summary: 'حذف کالا از فروشگاه' })
  async deleteProduct(@Param('id') id: string) {
    return this.productCommandService.deleteProduct(id);
  }
}
