import { Injectable, Logger } from '@nestjs/common';
import { WsSessionAbstract } from './interface/ws-sessoin.abstract';
import { MessageAbstract } from './interface/message.abstract';
import { FriendshipService } from '../friendship/friendship.service';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class ChatService {
    private readonly logger = new Logger(ChatService.name);
    constructor(
        private session: WsSessionAbstract,
        private message: MessageAbstract,
        private friendship: FriendshipService,
    ) {}

    async handleConnection(userId: string, socketId: string): Promise<void> {
        await this.session.addSession(userId, socketId);
        this.logger.log(`Session added for user ${userId}, socket ${socketId}`);
    }
    async handleDisconnect(socketId: string): Promise<void> {
        await this.session.removeSession(socketId);
        this.logger.log(`Session removed for socket ${socketId}`);
    }
    async sendNewMessage(senderId: string, receiverId: string, content: string) {
        this.logger.debug(`Save message data`);
        try {
            if (senderId === receiverId) {
                this.logger.warn(`${senderId} = ${receiverId}`);
                throw new WsException('Cannot send messages to yourself');
            }
            const isFriends = await this.friendship.validateByAcceptedStatus(senderId, receiverId);
            if (isFriends.status !== 'ACCEPTED') {
                this.logger.warn(`friendship status :${isFriends.status} !== ACCEPTED`);
                throw new WsException(`Messages can only be sent to friends`);
            }
            return await this.message.saveMessage(senderId, receiverId, content);
        } catch (error) {
            this.logger.error(`failed save message data`);
            if (error instanceof WsException) throw error.message;
        }
    }
    async getUserSockets(userId: string): Promise<string[]> {
        return await this.session.getUserSockets(userId);
    }
}
