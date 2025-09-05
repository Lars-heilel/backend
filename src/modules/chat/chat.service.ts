import { Injectable, Logger } from '@nestjs/common';
import { WsSessionAbstract } from './interface/ws-sessoin.abstract';

@Injectable()
export class ChatService {
    private readonly logger = new Logger(ChatService.name);
    constructor(private session: WsSessionAbstract) {}

    async handleConnection(userId: string, socketId: string): Promise<void> {
        await this.session.addSession(userId, socketId);
        this.logger.log(`Session added for user ${userId}, socket ${socketId}`);
    }
    async handleDisconnect(socketId: string): Promise<void> {
        await this.session.removeSession(socketId);
        this.logger.log(`Session removed for socket ${socketId}`);
    }

    async getUserSockets(userId: string): Promise<string[]> {
        return await this.session.getUserSockets(userId);
    }
}
