import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WsException,
    ConnectedSocket,
    WebSocketServer,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WsAuthStrategy } from './stratrgy/ws-auth.stategy';
import { SafeUser } from '../users/Types/user.types';
import { SendMessageSchema } from './DTO/sendMessage.dto';
import { ZodValidationPipe } from 'nestjs-zod';
import { OnEvent } from '@nestjs/event-emitter';
import { Friendship } from '@prisma/generated/client';
@WebSocketGateway({ cors: { origin: '*', credentials: true }, namespace: '/chat' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private readonly logger = new Logger(ChatGateway.name);
    constructor(
        private readonly chatService: ChatService,
        private authStrategy: WsAuthStrategy,
    ) {}

    async handleConnection(client: Socket) {
        this.logger.debug(`New connection attempt: ${client.id}`);
        try {
            const user = await this.authStrategy.authenticate(client);
            client.data = user;
            await this.chatService.handleConnection(user.id, client.id);
            this.logger.log(`Authenticated: ${user.email} (${client.id})`);

            client.emit('connection_success', {
                status: 'connected',
                userId: user.id,
                message: 'Authentication successful',
            });
        } catch (error: unknown) {
            if (error instanceof WsException) {
                this.logger.error(`Authentication failed: ${error.message}`);

                client.emit('connection_error', {
                    code: 'AUTH_FAILED',
                    message: error.message,
                });

                setTimeout(() => client.disconnect(), 100);
            }
        }
    }
    async handleDisconnect(client: Socket) {
        try {
            await this.chatService.handleDisconnect(client.id);
        } catch (error: unknown) {
            if (error instanceof WsException) {
                this.logger.error(`Disconnect error: ${error.message}`);
                client.emit('disconnect_error', {
                    message: 'Failed to clean session',
                });
            }
        }
    }
    @SubscribeMessage(`send_message`)
    async handleNewMessage(
        @ConnectedSocket() socket: Socket,
        @MessageBody(new ZodValidationPipe(SendMessageSchema))
        data: { receiverId: string; content: string },
    ) {
        const sender = socket.data as SafeUser;
        const savedMessage = await this.chatService.sendNewMessage(
            sender.id,
            data.receiverId,
            data.content,
        );
        socket.emit(`new_message_sent`, savedMessage);
        const receiverSockets = await this.chatService.getUserSockets(data.receiverId);

        for (const socketId of receiverSockets) {
            this.server.to(socketId).emit('new_message', savedMessage);
        }
    }
    @OnEvent('friendship.rejected')
    async handleFriendshipRejected(payload: Friendship) {
        this.logger.log(`Friendship rejected event for user ${payload.requesterId}`);
        const requesterSockets = await this.chatService.getUserSockets(payload.requesterId);
        for (const socketId of requesterSockets) {
            this.server.to(socketId).emit('friendship_request_rejected', {
                friendshipId: payload.id,
            });
        }
    }

    @OnEvent('friendship.deleted')
    async handleFriendshipDeleted(payload: {
        deletedBy: string;
        notifiedUser: string;
        friendshipId: string;
    }) {
        this.logger.log(`Friendship deleted event for user ${payload.notifiedUser}`);
        const notifiedUserSockets = await this.chatService.getUserSockets(payload.notifiedUser);
        for (const socketId of notifiedUserSockets) {
            this.server.to(socketId).emit('friendship_deleted', {
                friendshipId: payload.friendshipId,
            });
        }
    }

    @OnEvent('friendship.requested')
    async handleFriendshipRequested(payload: Friendship) {
        this.logger.log(`Friendship request event for user ${payload.addresseeId}`);
        const receiverSockets = await this.chatService.getUserSockets(payload.addresseeId);
        for (const socketId of receiverSockets) {
            this.server.to(socketId).emit('friendship_request_received', payload);
        }
    }

    @OnEvent('friendship.accepted')
    async handleFriendshipAccepted(payload: Friendship) {
        this.logger.log(`Friendship accepted event for user ${payload.requesterId}`);
        const requesterSockets = await this.chatService.getUserSockets(payload.requesterId);
        for (const socketId of requesterSockets) {
            this.server.to(socketId).emit('friendship_request_accepted', payload);
        }
    }
}
