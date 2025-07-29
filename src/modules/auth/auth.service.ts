import { Injectable } from '@nestjs/common';
import { TokensService } from './tokens/tokens.service';
import { MailsService } from '../mails/mails.service';
import { UsersService } from '../users/users.service';
import { Response } from 'express';
import { SafeUser } from '../users/Types/user.types';
import { JwtPayload } from './tokens/types/jwt-payload';
import { CreateUserDto } from '../users/DTO/createUser.dto';

@Injectable()
export class AuthService {
    constructor(
        private tokenService: TokensService,
        private mailsService: MailsService,
        private usersService: UsersService,
    ) {}

    async register(DTO: CreateUserDto): Promise<{ message: string }> {
        const user = await this.usersService.createUser(DTO);
        await this.mailsService.sendConfirmationEmail(user);
        return { message: 'To complete registration, confirm your account via your email' };
    }
    async login(user: SafeUser, res: Response): Promise<{ token: string; user: SafeUser }> {
        const payload: JwtPayload = { sub: user.id, email: user.email };
        const { access_token, refresh_token } = await this.tokenService.createTokens(payload);
        this.tokenService.setRefreshTokenCookie(res, refresh_token);
        return { token: access_token, user: user };
    }
    async logout(userId: string): Promise<{ message: string }> {
        await this.tokenService.revokeRefreshToken(userId);
        return { message: 'logout successful' };
    }
    async refresh(token: string, res: Response): Promise<string> {
        const payload = await this.tokenService.validateRefreshToken(token);
        const { access_token, refresh_token } = await this.tokenService.createTokens(payload);
        this.tokenService.setRefreshTokenCookie(res, refresh_token);
        return access_token;
    }
}
