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
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CarQueryService } from '../services/car-query.service';
import { CarCommandService } from '../services/car-command.service';
import { CreateCarSpecDto } from '../dto/create-car-spec.dto';
import { SocketType } from '../../products/schemas/product.schema';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@ApiTags('Cars & Bulb Fitment (پایه لامپ خودروها)')
@Controller('cars')
export class CarController {
  constructor(
    private readonly queryService: CarQueryService,
    private readonly commandService: CarCommandService,
  ) {}

  @Get('makes')
  @ApiOperation({ summary: 'لیست کمپانی‌های خودروسازی (ایران خودرو، سایپا، هیوندای...)' })
  async getMakes() {
    return this.queryService.getMakes();
  }

  @Get('models')
  @ApiOperation({ summary: 'لیست مدل‌های خودرو بر اساس کمپانی' })
  @ApiQuery({ name: 'make', required: false, type: String })
  async getModels(@Query('make') make?: string) {
    if (!make) return this.queryService.getAll();
    return this.queryService.getModelsByMake(make);
  }

  @Get('spec')
  @ApiOperation({ summary: 'پایه‌های دقیق نور پایین، نور بالا و مه‌شکن یک خودرو' })
  async getSpec(@Query('make') make: string, @Query('model') model: string) {
    return this.queryService.getSpec(make, model);
  }

  @Get('by-socket/:socket')
  @ApiOperation({ summary: 'لیست تمام خودروهایی که از یک پایه خاص استفاده می‌کنند' })
  async getBySocket(@Param('socket') socket: SocketType) {
    return this.queryService.getCarsBySocket(socket);
  }

  @Get('search')
  @ApiOperation({ summary: 'جستجوی زنده نام خودرو' })
  @ApiQuery({ name: 'q', required: true, type: String })
  async search(@Query('q') q: string) {
    return this.queryService.search(q);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'ثبت مشخصات خودروی جدید (ادمین)' })
  @HttpCode(HttpStatus.CREATED)
  async createSpec(@Body() dto: CreateCarSpecDto) {
    return this.commandService.createSpec(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'ویرایش مشخصات خودرو' })
  async updateSpec(@Param('id') id: string, @Body() dto: Partial<CreateCarSpecDto>) {
    return this.commandService.updateSpec(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'حذف خودرو' })
  async deleteSpec(@Param('id') id: string) {
    return this.commandService.deleteSpec(id);
  }
}
