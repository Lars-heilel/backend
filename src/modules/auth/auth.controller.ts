import {
  Body,
  Res,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from 'src/common/pipes/zod.validation.pipe';
import { RegisterDto, RegisterSchema } from './DTO/RegisterUserDto';
import { LoginSchema } from './DTO/LoginUserDto';
import { LocalAuthGuard } from 'src/common/guards/local-auth.guard';
import { userRequset } from './types/userRequest';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { EmailService } from '../security/email/email.service';
import { UsersService } from '../users/users.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private usersService: UsersService,
    private readonly authService: AuthService,
    private emailService: EmailService,
  ) {}

  @Post('register')
  @UsePipes(new ZodValidationPipe(RegisterSchema))
  async register(@Body() DTO: RegisterDto) {
    return await this.authService.register(DTO);
  }
  @Get('verifyAccount')
  async verifyAccount(@Query('token') token: string, @Res() res: Response) {
    const user = await this.emailService.validateToken('confirm', token);
    if (!user) throw new UnauthorizedException('Невалидный токен');
    await this.usersService.confirmEmail(user.email);
    const { access_token, refreshToken } = await this.authService.generateTokens(user);
    res.cookie('refreshToken', refreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
      httpOnly: true,
    });
    return { message: `Аккаунта пользователя ${user.email} подтвержден`, access_token };
  }

  @Post('login')
  @UsePipes(new ZodValidationPipe(LoginSchema))
  @UseGuards(LocalAuthGuard)
  async login(@Req() req: { user: userRequset }, @Res({ passthrough: true }) res: Response) {
    const { access_token, refreshToken } = await this.authService.login(req.user);
    res.cookie('refreshToken', refreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
      httpOnly: true,
    });
    return { access_token };
  }

  @Post('logout')
  async logout() {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return req.user;
  }
}
