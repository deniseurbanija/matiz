import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  private readonly isProd: boolean;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {
    this.isProd = config.get('NODE_ENV') === 'production';
  }

  async register(dto: RegisterDto, res: Response): Promise<User> {
    const user = await this.usersService.createWithPassword(dto);
    await this.issueTokens(user.id, res);
    return user;
  }

  // user is already validated by LocalStrategy
  async login(user: User, res: Response): Promise<User> {
    await this.issueTokens(user.id, res);
    return user;
  }

  // user is already validated by GoogleStrategy
  async handleGoogleCallback(user: User, res: Response): Promise<void> {
    await this.issueTokens(user.id, res);
    res.redirect(this.config.get<string>('FRONTEND_URL', 'http://localhost:3001'));
  }

  // user is already validated by JwtRefreshStrategy (token compared against DB)
  async refresh(user: User, res: Response): Promise<User> {
    await this.issueTokens(user.id, res);
    return user;
  }

  async logout(userId: string, res: Response): Promise<{ message: string }> {
    await this.usersService.clearRefreshToken(userId);
    this.clearCookies(res);
    return { message: 'Logged out' };
  }

  // ── Private ───────────────────────────────────────────────────────────────

  private async issueTokens(userId: string, res: Response): Promise<void> {
    const payload = { sub: userId };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: this.config.get('JWT_EXPIRES_IN', '15m'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '30d'),
    });

    await this.usersService.saveHashedRefreshToken(userId, refreshToken);
    this.setCookies(res, accessToken, refreshToken);
  }

  private setCookies(res: Response, accessToken: string, refreshToken: string): void {
    const base = { httpOnly: true, secure: this.isProd, sameSite: 'lax' as const };

    res.cookie('access_token', accessToken, {
      ...base,
      maxAge: 15 * 60 * 1000, // 15 min
    });

    res.cookie('refresh_token', refreshToken, {
      ...base,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: '/api/auth',                  // only sent to auth endpoints
    });
  }

  private clearCookies(res: Response): void {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token', { path: '/api/auth' });
  }
}
