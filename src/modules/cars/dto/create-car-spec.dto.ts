import { IsString, IsNotEmpty, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SocketType } from '../../products/schemas/product.schema';

export class CreateCarSpecDto {
  @ApiProperty({ example: 'ایران خودرو' })
  @IsString()
  @IsNotEmpty()
  carMake: string;

  @ApiProperty({ example: 'ری‌را (Reera)' })
  @IsString()
  @IsNotEmpty()
  carModel: string;

  @ApiPropertyOptional({ example: '1403 به بعد' })
  @IsOptional()
  @IsString()
  yearRange?: string;

  @ApiProperty({ enum: ['H1', 'H3', 'H4', 'H7', 'H11', 'H16', '9005', '9006', '880', 'D2S'], example: 'H7' })
  @IsEnum(['H1', 'H3', 'H4', 'H7', 'H11', 'H16', '9005', '9006', '880', 'D2S'])
  lowBeam: SocketType;

  @ApiProperty({ enum: ['H1', 'H3', 'H4', 'H7', 'H11', 'H16', '9005', '9006', '880', 'D2S'], example: 'H1' })
  @IsEnum(['H1', 'H3', 'H4', 'H7', 'H11', 'H16', '9005', '9006', '880', 'D2S'])
  highBeam: SocketType;

  @ApiPropertyOptional({ enum: ['H1', 'H3', 'H4', 'H7', 'H11', 'H16', '9005', '9006', '880', 'D2S'], example: 'H11' })
  @IsOptional()
  @IsEnum(['H1', 'H3', 'H4', 'H7', 'H11', 'H16', '9005', '9006', '880', 'D2S'])
  fogLight?: SocketType;

  @ApiPropertyOptional({ example: 'دارای لنز فابریک در نور پایین، نیازمند هدلایت چیپ دقیق بدون گرما' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  requiresCanbus?: boolean;
}
