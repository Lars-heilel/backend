import { Injectable, Logger } from '@nestjs/common';
import { SessionServiceInterface } from './interface/sessionServiceInterface';
import { WsSessionInterface } from './interface/wsSessionRepoInterface';

@Injectable()
export class SessionService implements SessionServiceInterface {
    private readonly logger = new Logger(SessionService.name);

    constructor(private sessionRepo: WsSessionInterface) {}

    async handleConnection(userId: string, socketId: string): Promise<void> {
        await this.sessionRepo.addSession(userId, socketId);
        this.logger.log(`Session added for user ${userId}, socket ${socketId}`);
    }

    async handleDisconnect(socketId: string): Promise<void> {
        await this.sessionRepo.removeSession(socketId);
        this.logger.log(`Session removed for socket ${socketId}`);
    }

    async getUserSockets(userId: string): Promise<string[]> {
        return this.sessionRepo.getUserSockets(userId);
    }
}
