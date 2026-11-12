import { IsOptional, IsString, IsNumber, IsEnum, IsBoolean, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SocketType, SportCategory } from '../schemas/product.schema';

export class FilterProductsDto {
  @ApiPropertyOptional({
    enum: [
      'روشنایی و هدلایت',
      'کیت بدنه و آیرودینامیک',
      'سیستم اگزوز و مکش',
      'سیستم تعلیق و فنربندی',
      'تزئینات و کابین اسپرت',
    ],
  })
  @IsOptional()
  @IsEnum([
    'روشنایی و هدلایت',
    'کیت بدنه و آیرودینامیک',
    'سیستم اگزوز و مکش',
    'سیستم تعلیق و فنربندی',
    'تزئینات و کابین اسپرت',
  ])
  category?: SportCategory;

  @ApiPropertyOptional({ enum: ['H1', 'H3', 'H4', 'H7', 'H11', 'H16', '9005', '9006', '880', 'D2S'] })
  @IsOptional()
  @IsEnum(['H1', 'H3', 'H4', 'H7', 'H11', 'H16', '9005', '9006', '880', 'D2S'])
  socketType?: SocketType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  material?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  carMake?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  carModel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  position?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minLumens?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minWattage?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  colorTemperature?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  hasCanbus?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  inStockOnly?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 12 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 12;

  @ApiPropertyOptional({ enum: ['price', 'createdAt', 'rating', 'salesCount'] })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'] })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
