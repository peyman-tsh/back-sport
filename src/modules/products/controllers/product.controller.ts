import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ProductQueryService } from '../services/product-query.service';
import { ProductCommandService } from '../services/product-command.service';
import { FilterProductsDto } from '../dto/filter-products.dto';
import { CreateProductDto } from '../dto/create-product.dto';
import { FindByCarDto } from '../dto/by-car.dto';

@ApiTags('Sport Products (لوازم اسپرت و تیونینگ خودرو)')
@Controller('products')
export class ProductController {
  constructor(
    private readonly queryService: ProductQueryService,
    private readonly commandService: ProductCommandService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'لیست لوازم اسپرت خودرو با فیلتر دسته‌بندی، برند، مدل خودرو و قیمت' })
  async getProducts(@Query() filterDto: FilterProductsDto) {
    return this.queryService.getFilteredProducts(filterDto);
  }

  @Get('featured')
  @ApiOperation({ summary: 'دریافت محصولات منتخب و پرفروش اسپرت برای صفحه اصلی' })
  async getFeatured(@Query('limit') limit?: number) {
    return this.queryService.getFeaturedProducts(limit ? Number(limit) : 8);
  }

  @Get('facets')
  @ApiOperation({ summary: 'دریافت خلاصه فیلترها (دسته‌بندی‌های اسپرت، برندها، پایه‌ها و رنج قیمت)' })
  async getFacets() {
    return this.queryService.getFilterFacets();
  }

  @Get('search')
  @ApiOperation({ summary: 'جستجوی زنده قطعات اسپرت (Live Search)' })
  @ApiQuery({ name: 'q', required: true, type: String })
  async search(@Query('q') q: string) {
    return this.queryService.searchFast(q);
  }

  @Get('by-car')
  @ApiOperation({ summary: 'جستجوی قطعات اسپرت سازگار با یک خودروی خاص' })
  async getByCar(@Query() dto: FindByCarDto) {
    return this.queryService.getProductsByCar(dto.carMake, dto.carModel, dto.position);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'دریافت اطلاعات تکی کالا بر اساس Slug برای سئو' })
  async getBySlug(@Param('slug') slug: string) {
    return this.queryService.getProductBySlug(slug);
  }

  @Post()
  @ApiOperation({ summary: 'افزودن کالای اسپرت جدید' })
  @HttpCode(HttpStatus.CREATED)
  async createProduct(@Body() dto: CreateProductDto) {
    return this.commandService.createProduct(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'به‌روزرسانی کالا' })
  async updateProduct(
    @Param('id') id: string,
    @Body() dto: Partial<CreateProductDto>,
  ) {
    return this.commandService.updateProduct(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف کالا' })
  async deleteProduct(@Param('id') id: string) {
    return this.commandService.deleteProduct(id);
  }
}
