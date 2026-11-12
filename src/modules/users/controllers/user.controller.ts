import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  Inject,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { INJECTION_TOKENS } from '../../../common/constants/tokens';
import { UserQueryService } from '../services/user-query.service';
import { UserCommandService } from '../services/user-command.service';
import { OrderQueryService } from '../../orders/services/order-query.service';
import { IUserDashboardService } from '../interfaces/user-dashboard.interface';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ShippingAddressDto } from '../../orders/dto/create-order.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

/**
 * Single Responsibility Principle (SRP):
 * UserController handles strictly HTTP transport, routing, parameters, authentication guards, and response dispatch.
 * All domain, business, and calculation logic is encapsulated within dedicated services.
 *
 * Dependency Inversion Principle (DIP):
 * Injects abstract IUserDashboardService via INJECTION_TOKENS.USER_DASHBOARD_SERVICE.
 */
@ApiTags('Users & Customer Panel (پنل مشتریان و پروفایل)')
@Controller('users')
export class UserController {
  constructor(
    private readonly queryService: UserQueryService,
    private readonly commandService: UserCommandService,
    private readonly orderQueryService: OrderQueryService,
    @Inject(INJECTION_TOKENS.USER_DASHBOARD_SERVICE)
    private readonly dashboardService: IUserDashboardService,
  ) {}

  @Get('me/dashboard')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'اطلاعات کامل پیشخوان و آمار پنل کاربری مشتری جاری' })
  @ApiResponse({ status: 200, description: 'داده‌های داشبورد کاربر بازگردانده شد.' })
  async getMyDashboard(@CurrentUser('id') userId: string) {
    return this.dashboardService.getCustomerDashboard(userId);
  }

  @Get('me/profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'مشاهده مشخصات حساب کاربری مشتری جاری' })
  async getMyProfile(@CurrentUser('id') userId: string) {
    return this.queryService.getUserById(userId);
  }

  @Put('me/profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ویرایش نام و ایمیل مشتری جاری' })
  async updateMyProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.commandService.updateProfile(userId, dto);
  }

  @Get('me/orders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'لیست تمام سفارش‌های مشتری جاری' })
  async getMyOrders(@CurrentUser('phoneNumber') phone: string) {
    return this.orderQueryService.getCustomerOrders(phone);
  }

  @Post('me/addresses')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'افزودن آدرس پستی جدید به حساب کاربری' })
  async addMyAddress(
    @CurrentUser('id') userId: string,
    @Body() addressDto: ShippingAddressDto,
  ) {
    return this.commandService.addAddress(userId, addressDto);
  }

  @Delete('me/addresses/:index')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'حذف آدرس پستی با ایندکس' })
  async removeMyAddress(
    @CurrentUser('id') userId: string,
    @Param('index', ParseIntPipe) index: number,
  ) {
    return this.commandService.removeAddress(userId, index);
  }

  @Post('me/favorites/:productId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'افزودن یا حذف محصول از لیست علاقه‌مندی‌ها' })
  async toggleMyFavorite(
    @CurrentUser('id') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.commandService.toggleFavorite(userId, productId);
  }

  // --- Legacy / Admin endpoints ---

  @Get('profile/:id')
  @ApiOperation({ summary: 'مشاهده مشخصات کاربر با شناسه' })
  async getProfile(@Param('id') id: string) {
    return this.queryService.getUserById(id);
  }

  @Put('profile/:id')
  @ApiOperation({ summary: 'ویرایش مشخصات کاربر با شناسه' })
  async updateProfile(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.commandService.updateProfile(id, dto);
  }

  @Post(':id/addresses')
  @ApiOperation({ summary: 'افزودن آدرس پستی با شناسه' })
  async addAddress(@Param('id') id: string, @Body() addressDto: ShippingAddressDto) {
    return this.commandService.addAddress(id, addressDto);
  }

  @Post(':id/favorites/:productId')
  @ApiOperation({ summary: 'علاقه‌مندی با شناسه' })
  async toggleFavorite(
    @Param('id') id: string,
    @Param('productId') productId: string,
  ) {
    return this.commandService.toggleFavorite(id, productId);
  }

  @Get()
  @ApiOperation({ summary: 'لیست کاربران (ادمین)' })
  async getAllUsers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.queryService.getAllUsers(Number(page) || 1, Number(limit) || 20);
  }
}
