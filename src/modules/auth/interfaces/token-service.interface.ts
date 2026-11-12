export interface JwtPayload {
  sub: string;
  phoneNumber: string;
  role: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ITokenService {
  generateTokens(payload: JwtPayload): Promise<AuthTokens>;
  verifyAccessToken(token: string): Promise<JwtPayload>;
  verifyRefreshToken(token: string): Promise<JwtPayload>;
}
