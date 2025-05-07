import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenService } from '../security/refresh-token/refresh-token.service';
import { userRequset } from './types/userRequest';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './DTO/RegisterUserDto';

@Injectable()
export class AuthService {
    constructor(
        private userService: UsersService,
        private jwt: JwtService,
        private refreshTokenService: RefreshTokenService,
    ) {}
    async register(DTO: RegisterDto) {
        const exitingUser = await this.userService.findUserByEmail(DTO.email);
        if (exitingUser)
            throw new ConflictException('Пользователь уже зарегестрирован');
        const user = await this.userService.createUser(DTO);
        return {
            user: user,
            message: `Пользователь ${user.email} успешно зарегестрирован!
            `,
        };
    }
    async login(user: userRequset) {
        const payload = { email: user.email, sub: user.id };
        const refreshToken =
            await this.refreshTokenService.generateRefreshToken(user);
        return {
            access_token: this.jwt.sign(payload),
            refresh_token: refreshToken,
        };
    }
    async logout(token: string) {
        await this.refreshTokenService.revokeRefreshToken(token);
        return { message: 'вы вышли из аккаунты' };
    }
}
