import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { INJECTION_TOKENS } from '../../../common/constants/tokens';
import { IAuthService } from '../interfaces/auth-service.interface';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';

@ApiTags('Authentication (احراز هویت و امنیت)')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(INJECTION_TOKENS.AUTH_SERVICE)
    private readonly authService: IAuthService,
  ) {}

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'ثبت‌نام کاربر جدید و دریافت توکن دسترسی' })
  @ApiResponse({ status: 201, description: 'ثبت‌نام با موفقیت انجام شد.' })
  @ApiResponse({ status: 409, description: 'شماره موبایل تکراری است.' })
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'ورود به سیستم با شماره همراه و رمز عبور' })
  @ApiResponse({ status: 200, description: 'ورود موفقیت‌آمیز و صدور توکن JWT.' })
  @ApiResponse({ status: 401, description: 'شماره یا رمز عبور نامعتبر است.' })
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'تمدید توکن منقضی‌شده با Refresh Token' })
  @ApiResponse({ status: 200, description: 'توکن جدید صادر شد.' })
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'دریافت اطلاعات پروفایل کاربر لاگین‌شده' })
  @ApiResponse({ status: 200, description: 'پروفایل کاربر جاری بازگردانده شد.' })
  @ApiResponse({ status: 401, description: 'توکن معتبر ارائه نشده است.' })
  @HttpCode(HttpStatus.OK)
  async getProfile(@CurrentUser('id') userId: string) {
    return this.authService.getProfile(userId);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'خروج امن از حساب کاربری' })
  @HttpCode(HttpStatus.OK)
  async logout() {
    return { success: true, message: 'خروج با موفقیت انجام شد.' };
  }
}
