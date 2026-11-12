import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsOptional,
  IsArray,
  IsBoolean,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SocketType, SportCategory } from '../schemas/product.schema';

export class CarCompatibilityDto {
  @ApiProperty({ example: 'ایران خودرو' })
  @IsString()
  @IsNotEmpty()
  carMake: string;

  @ApiProperty({ example: 'پژو 206' })
  @IsString()
  @IsNotEmpty()
  carModel: string;

  @ApiPropertyOptional({ example: 'سپر جلو / زیر شاسی' })
  @IsOptional()
  @IsString()
  position?: string;
}

export class ProductSeoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  metaDescription?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  keywords?: string[];
}

export class SoundClipDto {
  @ApiProperty({ example: 'حالت سایلنسر باز (غرش ریسینگ و دور موتور بالا)' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'سایلنسر باز' })
  @IsString()
  @IsNotEmpty()
  mode: string;

  @ApiPropertyOptional({ example: 'موتور TU5 - پژو ۲۰۶' })
  @IsOptional()
  @IsString()
  carModel?: string;

  @ApiPropertyOptional({ example: '/audio/exhaust-hks-open.mp3' })
  @IsOptional()
  @IsString()
  audioUrl?: string;

  @ApiPropertyOptional({ example: 15 })
  @IsOptional()
  @IsNumber()
  durationSeconds?: number;

  @ApiPropertyOptional({ example: 6500 })
  @IsOptional()
  @IsNumber()
  engineRpm?: number;

  @ApiPropertyOptional({ example: 'exhaust' })
  @IsOptional()
  @IsString()
  soundType?: string;
}

export class CreateProductDto {
  @ApiProperty({ example: 'کیت مکش هوای خنک استیل ۳۰۴ K&N با فیلتر مخروطی' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'kn-cold-air-intake-tu5' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ example: 'K&N' })
  @IsString()
  @IsNotEmpty()
  brand: string;

  @ApiProperty({
    example: 'سیستم اگزوز و مکش',
  })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiPropertyOptional({ enum: ['H1', 'H3', 'H4', 'H7', 'H11', 'H16', '9005', '9006', '880', 'D2S'], example: 'H7' })
  @IsOptional()
  @IsEnum(['H1', 'H3', 'H4', 'H7', 'H11', 'H16', '9005', '9006', '880', 'D2S'])
  socketType?: SocketType;

  @ApiPropertyOptional({ example: 'استیل ضد زنگ ۳۰۴ براق تایوانی' })
  @IsOptional()
  @IsString()
  material?: string;

  @ApiProperty({ example: 2150000 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 2450000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  originalPrice?: number;

  @ApiProperty({ example: 35 })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional({ example: 130 })
  @IsOptional()
  @IsNumber()
  wattage?: number;

  @ApiPropertyOptional({ example: 28000 })
  @IsOptional()
  @IsNumber()
  lumens?: number;

  @ApiPropertyOptional({ example: 6000 })
  @IsOptional()
  @IsNumber()
  colorTemperature?: number;

  @ApiPropertyOptional({ example: 'High Flow Synthetic Cotton' })
  @IsOptional()
  @IsString()
  chipType?: string;

  @ApiPropertyOptional({ example: 'عایق حرارتی سیلیکونی ۴ لایه' })
  @IsOptional()
  @IsString()
  coolingType?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  hasCanbus?: boolean;

  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @IsNumber()
  warrantyMonths?: number;

  @ApiProperty({ type: [String] })
  @IsArray()
  images: string[];

  @ApiProperty({ example: 'کیت مکش کامل همراه لوله استیل، بست‌های استیل و فیلتر شستشوپذیر' })
  @IsString()
  shortDescription: string;

  @ApiProperty({ example: 'توضیحات فنی کامل درباره اثر افزایش گشتاور و شتاب اولیه خودرو' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ type: [CarCompatibilityDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  compatibility?: CarCompatibilityDto[];

  @ApiPropertyOptional({ type: ProductSeoDto })
  @IsOptional()
  @ValidateNested()
  seo?: ProductSeoDto;

  @ApiPropertyOptional({ type: [SoundClipDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SoundClipDto)
  soundClips?: SoundClipDto[];

  @ApiPropertyOptional({ example: 'https://www.aparat.com/v/example' })
  @IsOptional()
  @IsString()
  videoDemoUrl?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}
