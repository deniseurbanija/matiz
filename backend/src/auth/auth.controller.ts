import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import * as express from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { User } from '../users/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    return this.authService.register(dto, res);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    return this.authService.login(user, res);
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google')
  googleAuth() {
    // Passport redirects to Google — no body needed
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  googleCallback(
    @CurrentUser() user: User,
    @Res() res: express.Response,
  ) {
    return this.authService.handleGoogleCallback(user, res);
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  refresh(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    return this.authService.refresh(user, res);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  logout(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    return this.authService.logout(user.id, res);
  }

  @Get('me')
  me(@CurrentUser() user: User) {
    return user;
  }
}
