import { IsString, IsNotEmpty, IsOptional, IsEmail, MinLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterUserDto {
  @ApiProperty({ example: 'رضا علوی' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: '09121112233' })
  @IsString()
  @Matches(/^09\d{9}$/, { message: 'شماره موبایل وارد شده معتبر نمی‌باشد (باید ۱۱ رقم باشد).' })
  phoneNumber: string;

  @ApiPropertyOptional({ example: 'reza@example.com' })
  @IsOptional()
  @IsEmail({}, { message: 'ایمیل وارد شده معتبر نیست.' })
  email?: string;

  @ApiProperty({ example: '12345678' })
  @IsString()
  @MinLength(6, { message: 'رمز عبور باید حداقل ۶ کاراکتر باشد.' })
  password: string;
}
