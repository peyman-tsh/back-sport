import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ReviewQueryService } from '../services/review-query.service';
import { ReviewCommandService } from '../services/review-command.service';
import { CreateReviewDto } from '../dto/create-review.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@ApiTags('Reviews & Ratings (نظرات و امتیازات نوری هدلایت‌ها)')
@Controller('reviews')
export class ReviewController {
  constructor(
    private readonly queryService: ReviewQueryService,
    private readonly commandService: ReviewCommandService,
  ) {}

  @Get('product/:productId')
  @ApiOperation({ summary: 'دریافت نظرات تایید شده یک محصول با صفحه‌بندی' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getProductReviews(
    @Param('productId') productId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.queryService.getReviewsForProduct(productId, Number(page) || 1, Number(limit) || 10);
  }

  @Get('product/:productId/summary')
  @ApiOperation({ summary: 'میانگین امتیاز خط کات، پرتاب نور و صدای فن هدلایت' })
  async getRatingSummary(@Param('productId') productId: string) {
    return this.queryService.getProductRatingSummary(productId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'ثبت نظر و امتیاز جدید برای هدلایت' })
  @HttpCode(HttpStatus.CREATED)
  async submitReview(@Body() dto: CreateReviewDto, @CurrentUser() user: { id: string; fullName: string }) {
    return this.commandService.submitReview(dto, user);
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'تایید نظر مشتری (توسط ادمین)' })
  async approveReview(@Param('id') id: string) {
    return this.commandService.approveReview(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'حذف نظر' })
  async deleteReview(@Param('id') id: string) {
    return this.commandService.deleteReview(id);
  }
}
