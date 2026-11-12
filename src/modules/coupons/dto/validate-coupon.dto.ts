import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ValidateCouponDto {
  @ApiProperty({ example: 'LUMIX20' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 2500000 })
  @IsNumber()
  @Min(0)
  orderAmount: number;
}
