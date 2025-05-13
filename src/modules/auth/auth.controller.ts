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
    Logger,
    Put,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from 'src/common/pipes/zod.validation.pipe';
import { RegisterDto, RegisterSchema } from './DTO/RegisterUserDto';
import { LoginSchema } from './DTO/LoginUserDto';
import { LocalAuthGuard } from 'src/common/guards/local-auth.guard';
import { UserRequest } from './types/userRequest';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { EmailService } from '../security/email/email.service';
import { UsersService } from '../users/users.service';
import { Response } from 'express';
import { RefreshTokenService } from '../security/refresh-token/refresh-token.service';
import { ResetPasswordDto, ResetPasswordSchema } from './DTO/ResetPassword.dto';

@Controller('auth')
export class AuthController {
    private readonly logger = new Logger(AuthController.name);
    constructor(
        private usersService: UsersService,
        private readonly authService: AuthService,
        private emailService: EmailService,
        private refreshTokenService: RefreshTokenService,
    ) {}

    @Post('register')
    @UsePipes(new ZodValidationPipe(RegisterSchema))
    async register(@Body() DTO: RegisterDto) {
        return await this.authService.register(DTO);
    }
    @Post('resendConfirmEmail')
    async resendConfirmEmail(@Body() DTO: RegisterDto) {
        this.logger.debug(`Повторное отправление письма подтверждения пользователю ${DTO.email}`);
        const exsitingUser = await this.usersService.findUserByEmail(DTO.email);
        if (!exsitingUser) throw new UnauthorizedException('Пользователь не найден');
        const accountIsComfirm = await this.usersService.isConfirmed(exsitingUser.id);
        if (accountIsComfirm) throw new Error('Аккаунт уже подтвержден ');
        const resend = await this.emailService.sendConfirmationEmail(exsitingUser, 'confirm');
        this.logger.log(`Письмо повторно отправлено`);
        return resend;
    }
    @Get('verifyAccount')
    async verifyAccount(@Query('token') token: string, @Res({ passthrough: true }) res: Response) {
        this.logger.debug(`Подтверждение и получения доступа для пользователя `);
        const user = await this.emailService.validateToken('confirm', token);
        if (!user) throw new UnauthorizedException('Невалидный токен');
        await this.usersService.confirmEmail(user.email);
        const isConfirmed = await this.usersService.isConfirmed(user.id);
        if (!isConfirmed) throw new UnauthorizedException('Аккаунт не подтвержден');
        const { access_token, refreshToken } = await this.authService.generateTokens(user);
        await this.refreshTokenService.setRefreshTokenCookie(res, refreshToken);
        return { message: `Аккаунта пользователя ${user.email} подтвержден`, access_token };
    }

    @Post('login')
    @UsePipes(new ZodValidationPipe(LoginSchema))
    @UseGuards(LocalAuthGuard)
    async login(@Req() req: { user: UserRequest }, @Res({ passthrough: true }) res: Response) {
        this.logger.debug(`данные из реквеста ${req.user.email},${req.user.id}`);
        const { access_token, refreshToken } = await this.authService.login(req.user);
        await this.refreshTokenService.setRefreshTokenCookie(res, refreshToken);
        return { access_token };
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    async logout(@Req() req: { user: UserRequest }) {
        this.logger.debug(`Выход ${req.user.id},${req.user.email}`);
        await this.refreshTokenService.revokeRefreshToken(req.user.id);
        return { message: 'Вы успешно вышли из системы' };
    }
    @Post('forgot-password')
    async forgotPassword(@Body('email') email: string) {
        this.logger.debug(`Запрос сброса пароля для ${email}`);
        const user = await this.usersService.findUserByEmail(email);
        if (!user) throw new UnauthorizedException('Пользователь не найден');

        await this.emailService.sendResetPasswordEmail(user, 'reset');
        return { message: 'Письмо с инструкциями отправлено на ваш email' };
    }

    @Put('reset-password')
    async resetPassword(
        @Query('token') token: string,
        @Body(new ZodValidationPipe(ResetPasswordSchema)) DTO: ResetPasswordDto,
    ) {
        this.logger.debug(`Попытка сброса пароля с токеном ${token}`);
        const user = await this.emailService.validateToken('reset', token);
        await this.usersService.updatePassword(user.email, DTO.password);
        await this.emailService.revokeToken('reset', token);
        return { message: 'Пароль успешно изменен' };
    }
}
