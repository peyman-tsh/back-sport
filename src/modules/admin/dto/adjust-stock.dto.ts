import { ApiProperty } from '@nestjs/swagger';
import { IsInt, NotEquals } from 'class-validator';

export class AdjustStockDto {
  @ApiProperty({ description: 'مقدار افزایش یا کاهش موجودی انبار (مثبت یا منفی)', example: 5 })
  @IsInt({ message: 'مقدار تغییر موجودی باید عدد صحیح باشد.' })
  @NotEquals(0, { message: 'مقدار تغییر موجودی نمی‌تواند صفر باشد.' })
  delta: number;
}
