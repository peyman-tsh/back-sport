import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'شماره موبایل کاربر', example: '09121234567' })
  @IsString()
  @IsNotEmpty({ message: 'شماره موبایل الزامی است.' })
  @Matches(/^09[0-9]{9}$/, {
    message: 'شماره موبایل نامعتبر است. فرمت صحیح: ۰۹xxxxxxxxx',
  })
  phoneNumber: string;

  @ApiProperty({ description: 'رمز عبور', example: 'SecretPass123' })
  @IsString()
  @IsNotEmpty({ message: 'رمز عبور الزامی است.' })
  @MinLength(6, { message: 'رمز عبور باید حداقل ۶ کاراکتر باشد.' })
  password: string;
}
