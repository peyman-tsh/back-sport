import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FindByCarDto {
  @ApiProperty({ example: 'ایران خودرو' })
  @IsString()
  @IsNotEmpty()
  carMake: string;

  @ApiProperty({ example: 'پژو 206' })
  @IsString()
  @IsNotEmpty()
  carModel: string;

  @ApiPropertyOptional({ example: 'سپر جلو' })
  @IsOptional()
  @IsString()
  position?: string;
}
