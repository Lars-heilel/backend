import { Injectable, Logger, Inject, ForbiddenException } from '@nestjs/common';
import { RefreshTokensRepositoryAbsctract } from './repositories/refreshToken/refreshTokens.repository.abstract';
import { ConfigService } from '@nestjs/config';
import { Env } from 'src/core/config/envConfig';
import { Response } from 'express';
import { JwtPayload } from './types/jwt-payload';
import { UserServiceInterface } from '@src/modules/users/interface/userServiceInterface';
import { ENCRYPTION_SERVICE, JWT_SERVICE, USER_SERVICE } from '@src/core/constants/di-token';
import { EncryptionInterface } from '@src/core/security/encryption/interface/encryprion.interface';
import { JwtServiceInterface } from '@src/core/security/jwt/interface/jwt.interface';

@Injectable()
export class TokensService {
    private readonly logger = new Logger(TokensService.name);

    constructor(
        @Inject(USER_SERVICE) private readonly usersService: UserServiceInterface,
        private readonly RefreshRepo: RefreshTokensRepositoryAbsctract,
        @Inject(JWT_SERVICE) private readonly jwt: JwtServiceInterface,
        private env: ConfigService<Env>,
        @Inject(ENCRYPTION_SERVICE) private readonly bcrypt: EncryptionInterface,
    ) {}

    async createTokens(payload: JwtPayload) {
        this.logger.debug(`Creating tokens for user: ${JSON.stringify(payload)}`);
        const [access_token, refresh_token] = await Promise.all([
            await this.jwt.signToken(payload, {
                secret: this.env.getOrThrow('JWT_SECRET'),
                expiresIn: this.env.getOrThrow('JWT_EXPIRES'),
            }),
            await this.jwt.signToken(payload, {
                secret: this.env.getOrThrow('JWT_SECRET_REFRESH'),
                expiresIn: this.env.getOrThrow('JWT_REFRESH_EXPIRES'),
            }),
        ]);
        await this.saveRefreshInDb({ userId: payload.sub, refreshToken: refresh_token });
        this.logger.log(`Tokens created for user: ${payload.sub}`);
        return { access_token, refresh_token };
    }

    async saveRefreshInDb(data: { userId: string; refreshToken: string }) {
        this.logger.debug(`Saving refresh token for user: ${data.userId}`);
        const hashedToken = await this.bcrypt.hash(data.refreshToken);
        const result = await this.RefreshRepo.createRefreshToken({
            ...data,
            refreshToken: hashedToken,
        });

        this.logger.log(`Refresh token saved for user: ${data.userId}`);
        return result;
    }

    setRefreshTokenCookie(res: Response, token: string) {
        this.logger.debug(`Setting refresh token cookie`);
        res.cookie('refreshToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
    }

    async revokeRefreshToken(userId: string) {
        this.logger.debug(`Revoking refresh tokens for user: ${userId}`);
        await this.RefreshRepo.deleteRefreshToken(userId);
        this.logger.log(`Refresh tokens revoked for user: ${userId}`);
    }

    async validateRefreshToken(token: string): Promise<JwtPayload> {
        this.logger.debug(`Validating refresh token for user`);
        const payload = await this.jwt.verifyToken(token, {
            secret: this.env.getOrThrow('JWT_SECRET_REFRESH'),
        });
        const user = await this.usersService.findUserById(payload.sub);

        if (payload.sub !== user.id) {
            this.logger.warn(`Invalid token subject for user: ${user.id}`);
            throw new ForbiddenException('Invalid token subject');
        }

        const storedToken = await this.RefreshRepo.findRefreshToken(user.id);
        if (!storedToken) {
            this.logger.warn(`Token not found for user: ${user.id}`);
            throw new ForbiddenException('Token not found');
        }

        const isValidToken = await this.bcrypt.compare(token, storedToken.refreshToken);
        if (!isValidToken) {
            this.logger.warn(`Invalid token for user: ${user.id}`);
            throw new ForbiddenException('Invalid token');
        }

        const currentTime = Date.now();
        const tokenExpiration = storedToken.expiresAt.getTime();
        if (tokenExpiration < currentTime) {
            this.logger.warn(`Token expired for user: ${user.id}`);
            await this.RefreshRepo.deleteRefreshToken(user.id);
            throw new ForbiddenException('Token expired');
        }
        this.logger.log(`Refresh token validated for user: ${user.id}`);
        return { sub: user.id, email: user.email };
    }
}
