import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ description: 'توکن تازه‌سازی (Refresh Token)' })
  @IsString()
  @IsNotEmpty({ message: 'ارائه توکن تازه‌سازی الزامی است.' })
  refreshToken: string;
}
