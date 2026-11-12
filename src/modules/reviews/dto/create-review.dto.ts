import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  IsOptional,
  IsArray,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ example: '64a123f...' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  productId: string;

  @ApiProperty({ example: 'محمدرضا کاظمی' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'نام باید حداقل ۲ حرف باشد' })
  @MaxLength(60, { message: 'نام نمی‌تواند بیش از ۶۰ کاراکتر باشد' })
  customerName: string;

  @ApiPropertyOptional({ example: 'پژو 206 تیپ 5 - نور پایین' })
  @IsOptional()
  @IsString()
  @MaxLength(80, { message: 'مدل خودرو نمی‌تواند بیش از ۸۰ کاراکتر باشد' })
  carModel?: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ example: 5, minimum: 1, maximum: 5 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  cutOffLineScore?: number;

  @ApiPropertyOptional({ example: 5, minimum: 1, maximum: 5 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  beamThrowScore?: number;

  @ApiPropertyOptional({ example: 4, minimum: 1, maximum: 5 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  fanNoiseScore?: number;

  @ApiProperty({ example: 'خط کات این هدلایت فوق‌العاده است و چشم راننده روبرو رو اصلاً اذیت نمی‌کنه.' })
  @IsString()
  @IsNotEmpty()
  @MinLength(5, { message: 'متن نظر باید حداقل ۵ حرف باشد' })
  @MaxLength(1000, { message: 'متن نظر نمی‌تواند بیش از ۱۰۰۰ کاراکتر باشد' })
  comment: string;

  @ApiPropertyOptional({ type: [String], example: ['خط کات تیز', 'پرتاب نور عالی'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(100, { each: true, message: 'هر نکته مثبت نمی‌تواند بیش از ۱۰۰ کاراکتر باشد' })
  advantages?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(100, { each: true, message: 'هر نکته منفی نمی‌تواند بیش از ۱۰۰ کاراکتر باشد' })
  disadvantages?: string[];
}
