import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class UpdateStockDto {
  @ApiProperty({ description: 'تعداد کل جدید موجودی انبار', example: 15, minimum: 0 })
  @IsInt({ message: 'تعداد موجودی باید عدد صحیح باشد.' })
  @Min(0, { message: 'موجودی انبار نمی‌تواند کمتر از صفر باشد.' })
  stock: number;
}
