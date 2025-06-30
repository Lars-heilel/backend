import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Socket } from 'socket.io';
import { Env } from 'src/core/config/envConfig';
import { JwtAbstract } from 'src/core/security/jwt/jwt.abstract';
import { JwtPayload } from 'src/modules/auth/tokens/types/jwt-payload';
import { SafeUser } from 'src/modules/users/Types/user.types';
import { UsersService } from 'src/modules/users/users.service';

@Injectable()
export class WsAuthStrategy {
    private readonly logger = new Logger(WsAuthStrategy.name);
    constructor(
        private jwt: JwtAbstract,
        private usersService: UsersService,
        private env: ConfigService<Env>,
    ) {}
    async authenticate(client: Socket): Promise<SafeUser> {
        const token = this.extractToken(client);
        const payload = await this.verifyToken(token);
        return await this.validateUser(payload.sub);
    }

    private extractToken(client: Socket) {
        const token = client.handshake.headers.authorization;
        if (!token) {
            this.logger.warn('No authentication token provided');
            throw new Error('Missing credentials');
        }
        this.logger.debug(`Token extracted: ${token.slice(0, 10)}...`);
        return token;
    }
    private async verifyToken(token: string): Promise<JwtPayload> {
        try {
            return await this.jwt.verifyToken(token, {
                secret: this.env.getOrThrow('JWT_SECRET'),
            });
        } catch (error) {
            this.logger.warn(`Invalid token: ${error.message}`);
            throw new Error('Invalid session');
        }
    }
    private async validateUser(userId: string): Promise<SafeUser> {
        const user = await this.usersService.findUserById(userId);

        if (!user) {
            this.logger.warn(`User not found: ${userId}`);
            throw new Error('Account not found');
        }

        if (!user.isConfirmed) {
            this.logger.warn(`Unauthorized access attempt by unconfirmed user: ${userId}`);
            throw new Error('Please confirm your email');
        }

        this.logger.log(`User authenticated: ${user.email} (${user.id})`);
        const { ...safeUser }: SafeUser = user;
        return safeUser;
    }
}
