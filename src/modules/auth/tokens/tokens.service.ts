import {
    Injectable,
    UnauthorizedException,
    Logger,
    InternalServerErrorException,
} from '@nestjs/common';
import { RefreshTokensRepositoryAbsctract } from './repositories/refreshToken/refreshTokens.repository.abstract';

import { ConfigService } from '@nestjs/config';
import { Env } from 'src/core/config/envConfig';
import { Response } from 'express';
import { EncryptionAbstract } from 'src/core/security/encryption/encryption.abstract';
import { JwtAbstract } from 'src/core/security/jwt/jwt.abstract';
import { JwtPayload } from './types/jwt-payload';
import { UsersService } from 'src/modules/users/users.service';

@Injectable()
export class TokensService {
    private readonly logger = new Logger(TokensService.name);

    constructor(
        private readonly RefreshRepo: RefreshTokensRepositoryAbsctract,
        private jwt: JwtAbstract,
        private env: ConfigService<Env>,
        private bcrypt: EncryptionAbstract,
        private usersService: UsersService,
    ) {}

    async createTokens(payload: JwtPayload) {
        this.logger.debug(`Creating tokens for user: ${JSON.stringify(payload)}`);
        try {
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
        } catch (error) {
            this.logger.error(`Token creation failed for user: ${payload.sub}`, error.message);
            throw new InternalServerErrorException('Token generation failed');
        }
    }

    async saveRefreshInDb(data: { userId: string; refreshToken: string }) {
        this.logger.debug(`Saving refresh token for user: ${data.userId}`);
        try {
            const hashedToken = await this.bcrypt.hash(data.refreshToken);
            const result = await this.RefreshRepo.createRefreshToken({
                ...data,
                refreshToken: hashedToken,
            });

            this.logger.log(`Refresh token saved for user: ${data.userId}`);
            return result;
        } catch (error) {
            this.logger.error(`Save refresh token failed for user: ${data.userId}`, error.message);
            throw new InternalServerErrorException('Token storage failed');
        }
    }

    async setRefreshTokenCookie(res: Response, token: string) {
        this.logger.debug(`Setting refresh token cookie`);
        res.cookie('refreshToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
    }

    async revokeRefreshToken(userId: string) {
        this.logger.debug(`Revoking refresh tokens for user: ${userId}`);
        try {
            await this.RefreshRepo.deleteRefreshToken(userId);
            this.logger.log(`Refresh tokens revoked for user: ${userId}`);
        } catch (error) {
            this.logger.error(`Revoke tokens failed for user: ${userId}`, error.message);
            throw new InternalServerErrorException('Token revocation failed');
        }
    }

    async validateRefreshToken(token: string): Promise<JwtPayload> {
        this.logger.debug(`Validating refresh token for user`);
        try {
            const payload = await this.jwt.verifyToken(token, {
                secret: this.env.getOrThrow('JWT_SECRET_REFRESH'),
            });
            const user = await this.usersService.findUserById(payload.sub);

            if (payload.sub !== user.id) {
                this.logger.warn(`Invalid token subject for user: ${user.id}`);
                throw new UnauthorizedException('Invalid token subject');
            }

            const storedToken = await this.RefreshRepo.findRefreshToken(user.id);
            if (!storedToken) {
                this.logger.warn(`Token not found for user: ${user.id}`);
                throw new UnauthorizedException('Token not found');
            }

            const isValidToken = await this.bcrypt.compare(token, storedToken.refreshToken);
            if (!isValidToken) {
                this.logger.warn(`Invalid token for user: ${user.id}`);
                throw new UnauthorizedException('Invalid token');
            }

            const currentTime = Date.now();
            const tokenExpiration = storedToken.expiresAt.getTime();
            if (tokenExpiration < currentTime) {
                this.logger.warn(`Token expired for user: ${user.id}`);
                await this.RefreshRepo.deleteRefreshToken(user.id);
                throw new UnauthorizedException('Token expired');
            }
            this.logger.log(`Refresh token validated for user: ${user.id}`);
            return { sub: user.id, email: user.email };
        } catch (error) {
            this.logger.error(`Refresh token validation failed `, error.message);
            throw new UnauthorizedException('Invalid refresh token');
        }
    }
}
