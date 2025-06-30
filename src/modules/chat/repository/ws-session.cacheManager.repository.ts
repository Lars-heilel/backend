import { Injectable, Logger } from '@nestjs/common';
import { WsSessionAbstract } from '../interface/ws-sessoin.abstract';
import { WsException } from '@nestjs/websockets';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';

@Injectable()
export class WsSessionRepository extends WsSessionAbstract {
    private readonly USER_SESSIONS_KEY = 'ws:user_sessions';
    private readonly SOCKET_USER_MAP_KEY = 'ws:socket_user_map';
    private readonly logger = new Logger(WsSessionRepository.name);

    constructor(@InjectRedis() private readonly redis: Redis) {
        super();
    }

    async addSession(userId: string, socketId: string): Promise<void> {
        this.logger.debug(`Saving session: user=${userId}, socket=${socketId}`);

        try {
            // Используем транзакцию для атомарности операций
            await this.redis
                .multi()
                .hset(this.SOCKET_USER_MAP_KEY, socketId, userId)
                .sadd(`${this.USER_SESSIONS_KEY}:${userId}`, socketId)
                .exec();

            this.logger.debug(`Session saved successfully`);
        } catch (error) {
            this.logger.error(`Failed to save session: ${error.message}`);
            throw new WsException('Failed to save session');
        }
    }

    async removeSession(socketId: string): Promise<void> {
        this.logger.debug(`Removing session: socket=${socketId}`);

        try {
            const userId = await this.redis.hget(this.SOCKET_USER_MAP_KEY, socketId);

            if (!userId) {
                this.logger.warn(`No user found for socket: ${socketId}`);
                return;
            }

            // Атомарное удаление
            await this.redis
                .multi()
                .hdel(this.SOCKET_USER_MAP_KEY, socketId)
                .srem(`${this.USER_SESSIONS_KEY}:${userId}`, socketId)
                .exec();

            this.logger.debug(`Session removed successfully`);
        } catch (error) {
            this.logger.error(`Failed to remove session: ${error.message}`);
        }
    }

    async getUserId(socketId: string): Promise<string> {
        const userId = await this.redis.hget(this.SOCKET_USER_MAP_KEY, socketId);

        if (!userId) {
            throw new WsException(`User not found for socket: ${socketId}`);
        }

        return userId;
    }

    async getUserSockets(userId: string): Promise<string[]> {
        try {
            // Используем Set для хранения сокетов пользователя
            const sockets = await this.redis.smembers(`${this.USER_SESSIONS_KEY}:${userId}`);
            this.logger.debug(`Found ${sockets.length} sockets for user ${userId}`);
            return sockets;
        } catch (error) {
            this.logger.error(`Failed to get user sockets: ${error.message}`);
            return [];
        }
    }
}
