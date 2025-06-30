import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { MailTokenManagerAbstract } from './mail-token-manager.abstract';
import { MailTokenType } from '../types/mail-token-manager.type';
import { SafeUser } from 'src/modules/users/Types/user.types';
import { UserFromCache } from '../types/userFromCache';

@Injectable()
export class CacheTokenManager extends MailTokenManagerAbstract {
    private readonly logger = new Logger(CacheTokenManager.name);

    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
        super();
    }

    async generateAndCacheTokens(user: SafeUser, type: MailTokenType): Promise<string> {
        const operation = `Generate ${type} token`;
        this.logger.debug(`${operation} for user ${user.id}`);

        try {
            const oldTokenKey = `${type}:user:${user.id}`;
            this.logger.verbose(`Checking existing token: ${oldTokenKey}`);

            const oldToken = await this.cacheManager.get<string>(oldTokenKey);
            if (oldToken) {
                this.logger.verbose(`Found existing token: ${oldToken.substring(0, 8)}...`);
                await this.cacheManager.del(`${type}:${oldToken}`);
                this.logger.verbose(`Revoked previous token: ${oldToken.substring(0, 8)}...`);
            }

            const token = randomBytes(32).toString('hex');
            const ttl = type === 'confirm' ? 3600 * 1000 : 900 * 1000;

            this.logger.verbose(`Caching token ${token.substring(0, 8)}... for ${ttl / 1000} sec`);
            await this.cacheManager.set(`${type}:${token}`, user, ttl);
            await this.cacheManager.set(oldTokenKey, token, ttl);

            this.logger.log(`${type.toUpperCase()} token created for ${user.email}`);
            return token;
        } catch (error) {
            this.logger.error(`${operation} failed for user ${user.id}`, {
                error: error.message,
                stack: error.stack,
                userId: user.id,
            });
            throw new InternalServerErrorException('Token generation failed');
        }
    }

    async validateToken(type: MailTokenType, token: string) {
        const cacheKey = `${type}:${token}`;
        this.logger.debug(`Validating ${type} token: ${cacheKey}`);

        try {
            const user = await this.cacheManager.get<UserFromCache>(cacheKey);
            if (!user) {
                this.logger.warn(`Token validation failed: invalid or expired`, {
                    tokenPrefix: token.substring(0, 8),
                    type,
                });
                throw new Error('Invalid or expired token');
            }

            this.logger.verbose(`Token validated for user ${user.id}`);
            return user;
        } catch (error) {
            this.logger.error(`${type} token validation failed`, {
                error: error.message,
                tokenPrefix: token.substring(0, 8),
                type,
            });
            throw new InternalServerErrorException('Token validation failed');
        }
    }

    async revokeToken(type: MailTokenType, token: string): Promise<void> {
        const cacheKey = `${type}:${token}`;
        this.logger.debug(`Revoking token: ${cacheKey}`);

        try {
            await this.cacheManager.del(cacheKey);
            this.logger.verbose(`Token revoked: ${token.substring(0, 8)}...`);
        } catch (error) {
            this.logger.error(`Token revocation failed`, {
                error: error.message,
                tokenPrefix: token.substring(0, 8),
                type,
            });
            throw new InternalServerErrorException('Token revocation failed');
        }
    }
}
