import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { INJECTION_TOKENS } from '../../common/constants/tokens';
import { UsersModule } from '../users/users.module';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { HashService } from './services/hash.service';
import { TokenService } from './services/token.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>(
          'JWT_SECRET',
          'lumix_sport_ultra_secure_jwt_secret_key_2026!',
        ),
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN', '1d'),
        },
      }),
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: INJECTION_TOKENS.HASH_SERVICE,
      useClass: HashService,
    },
    {
      provide: INJECTION_TOKENS.TOKEN_SERVICE,
      useClass: TokenService,
    },
    {
      provide: INJECTION_TOKENS.AUTH_SERVICE,
      useClass: AuthService,
    },
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [
    INJECTION_TOKENS.AUTH_SERVICE,
    INJECTION_TOKENS.TOKEN_SERVICE,
    INJECTION_TOKENS.HASH_SERVICE,
    JwtAuthGuard,
    RolesGuard,
    PassportModule,
    JwtModule,
  ],
})
export class AuthModule {}
