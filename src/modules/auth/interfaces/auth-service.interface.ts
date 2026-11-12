import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { AuthTokens } from './token-service.interface';

export interface AuthResponse {
  user: {
    id: string;
    fullName: string;
    phoneNumber: string;
    email?: string;
    role: string;
  };
  tokens: AuthTokens;
}

export interface IAuthService {
  register(dto: RegisterDto): Promise<AuthResponse>;
  login(dto: LoginDto): Promise<AuthResponse>;
  refreshToken(token: string): Promise<AuthTokens>;
  getProfile(userId: string): Promise<any>;
}
