import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsNumber,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class OrderItemDto {
  @ApiProperty({ example: '64a123f...' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class ShippingAddressDto {
  @ApiProperty({ example: 'علی رضایی' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: '09121234567' })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ example: 'تهران' })
  @IsString()
  @IsNotEmpty()
  province: string;

  @ApiProperty({ example: 'تهران' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'خیابان ملت، پاساژ کاشانی، پلاک ۱۲' })
  @IsString()
  @IsNotEmpty()
  postalAddress: string;

  @ApiProperty({ example: '1114912345' })
  @IsString()
  @IsNotEmpty()
  postalCode: string;
}

export class CreateOrderDto {
  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ type: ShippingAddressDto })
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;

}
