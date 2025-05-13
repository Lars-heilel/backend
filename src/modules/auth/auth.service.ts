import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenService } from '../security/refresh-token/refresh-token.service';
import { UserRequest } from './types/userRequest';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './DTO/RegisterUserDto';
import { EmailService } from '../security/email/email.service';
import { CreateToken } from './DTO/CreateToken.dto';

@Injectable()
export class AuthService {
    constructor(
        private emailService: EmailService,
        private userService: UsersService,
        private jwt: JwtService,
        private refreshTokenService: RefreshTokenService,
    ) {}
    async generateTokens(user: CreateToken) {
        const payload = { email: user.email, sub: user.id };
        const refreshToken = await this.refreshTokenService.generateRefreshToken(user);
        return { access_token: this.jwt.sign(payload), refreshToken };
    }
    async register(DTO: RegisterDto) {
        const user = await this.userService.createUser(DTO);
        await this.emailService.sendConfirmationEmail(user, 'confirm');
        return {
            user: user,
            message: `Для завершения процедуры регистрации проверьте почту: ${user.email}
            `,
        };
    }
    async login(user: UserRequest) {
        const token = await this.generateTokens(user);
        return token;
    }
    async logout(token: string) {
        await this.refreshTokenService.revokeRefreshToken(token);
        return { message: 'вы вышли из аккаунты' };
    }
}
