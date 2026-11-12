import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  Matches,
  MinLength,
  MaxLength,
  IsOptional,
  IsEmail,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ description: 'نام و نام خانوادگی کاربر', example: 'علیرضا اسپرتی' })
  @IsString({ message: 'نام و نام خانوادگی باید رشته متنی باشد.' })
  @IsNotEmpty({ message: 'نام و نام خانوادگی الزامی است.' })
  @MinLength(3, { message: 'نام و نام خانوادگی باید حداقل ۳ کاراکتر باشد.' })
  @MaxLength(60, { message: 'نام و نام خانوادگی حداکثر ۶۰ کاراکتر است.' })
  fullName: string;

  @ApiProperty({ description: 'شماره تلفن همراه ۱۱ رقمی معتبر ایران', example: '09121234567' })
  @IsString()
  @IsNotEmpty({ message: 'شماره موبایل الزامی است.' })
  @Matches(/^09[0-9]{9}$/, {
    message: 'شماره موبایل وارد شده نامعتبر است. فرمت صحیح: ۰۹xxxxxxxxx',
  })
  phoneNumber: string;

  @ApiProperty({ description: 'رمز عبور حداقل ۶ کاراکتر', example: 'SecretPass123' })
  @IsString()
  @IsNotEmpty({ message: 'رمز عبور الزامی است.' })
  @MinLength(6, { message: 'رمز عبور باید حداقل ۶ کاراکتر باشد.' })
  @MaxLength(50, { message: 'رمز عبور حداکثر ۵۰ کاراکتر است.' })
  password: string;

  @ApiPropertyOptional({ description: 'آدرس ایمیل اختیاری', example: 'alireza@tuning.ir' })
  @IsOptional()
  @IsEmail({}, { message: 'فرمت ایمیل وارد شده نامعتبر است.' })
  email?: string;
}
