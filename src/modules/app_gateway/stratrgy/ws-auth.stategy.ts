import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Env } from 'src/core/config/envConfig';
import { JwtPayload } from 'src/modules/auth/tokens/types/jwt-payload';
import { SafeUser } from 'src/modules/users/Types/user.types';
import { JwtTokenAuthSchema } from '../DTO/token.dto';
import { UserServiceInterface } from '@src/modules/users/interface/userServiceInterface';
import { JWT_SERVICE, USER_SERVICE } from '@src/core/config/di-token';
import { JwtServiceInterface } from '@src/core/security/jwt/interface/jwt.interface';

@Injectable()
export class WsAuthStrategy {
    private readonly logger = new Logger(WsAuthStrategy.name);
    constructor(
        @Inject(USER_SERVICE) private usersService: UserServiceInterface,
        @Inject(JWT_SERVICE) private jwt: JwtServiceInterface,

        private env: ConfigService<Env>,
    ) {}
    async authenticate(client: Socket): Promise<SafeUser> {
        const token = this.extractToken(client);
        const parsedToken = await JwtTokenAuthSchema.safeParseAsync({ token });
        if (!parsedToken.success) {
            this.logger.warn(`Invalid token format: ${token}`);
            throw new WsException(parsedToken.error.errors[0].message);
        }
        const payload = await this.verifyToken(token);
        return await this.validateUser(payload.sub);
    }

    private extractToken(client: Socket) {
        const token = client.handshake.headers.authorization;
        if (!token) {
            this.logger.warn('No authentication token provided');
            throw new WsException('Missing credentials');
        }
        return token.split(' ')[1];
    }
    private async verifyToken(token: string): Promise<JwtPayload> {
        const payload = await this.jwt.verifyToken(token, {
            secret: this.env.getOrThrow('JWT_SECRET', { infer: true }),
        });
        return payload;
    }
    private async validateUser(userId: string): Promise<SafeUser> {
        const user = await this.usersService.findUserById(userId);

        if (!user) {
            this.logger.warn(`User not found: ${userId}`);
            throw new WsException('Account not found');
        }

        if (!user.isConfirmed) {
            this.logger.warn(`Unauthorized access attempt by unconfirmed user: ${userId}`);
            throw new WsException('Please confirm your email');
        }

        this.logger.log(`User authenticated: ${user.email} (${user.id})`);
        const { ...safeUser }: SafeUser = user;
        return safeUser;
    }
}
