import { IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({ example: '09121112233' })
  @IsString()
  @Matches(/^09\d{9}$/, { message: 'شماره موبایل نامعتبر است.' })
  phoneNumber: string;

  @ApiProperty({ example: '12345678' })
  @IsString()
  @MinLength(6)
  password: string;
}
