import {
    WebSocketGateway,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WsException,
    WebSocketServer,
    MessageBody,
    SubscribeMessage,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Inject, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WsAuthStrategy } from './stratrgy/ws-auth.stategy';
import { OnEvent } from '@nestjs/event-emitter';
import { Friendship } from '@prisma/generated/client';
import {
    SESSION_SERVICE_INTERFACE,
    SessionServiceInterface,
} from './interface/sessionServiceInterface';
import {
    MESSAGE_SERVICE_INTERFACE,
    MessageServiceInterface,
} from '../message/interface/messageServiceIntreface';
import {
    CHAT_ROOM_SERVICE_INTERFACE,
    ChatRoomServiceInterface,
} from '../chat-room/interface/chatRoomServiceIntreface';
import { SendMessageGatewayDto } from './DTO/sendMessageGateway.schema';
import { ZodValidationPipe } from 'nestjs-zod';
import { SafeUser } from '../users/Types/user.types';
import { SOCKET_EVENTS, FRIENDSHIP_EVENT, MESSAGE_EVENT } from './const/event-const';
import { Env } from '@src/core/config/envConfig';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
    namespace: '/rocket_socket',
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private readonly logger = new Logger(AppGateway.name);
    constructor(
        @Inject(SESSION_SERVICE_INTERFACE) private readonly sessionService: SessionServiceInterface,
        @Inject(MESSAGE_SERVICE_INTERFACE) private readonly messageService: MessageServiceInterface,
        @Inject(CHAT_ROOM_SERVICE_INTERFACE)
        private readonly chatRoomService: ChatRoomServiceInterface,
        private authStrategy: WsAuthStrategy,
        private env: ConfigService<Env>,
    ) {}
    onModuleInit() {
        const clientUrl = this.env.getOrThrow('CLIENT_URL', { infer: true });
        this.logger.log(`Configuring WebSocket CORS for origin: ${clientUrl}`);
        this.server.engine.opts.cors = {
            origin: ['http://localhost:5173', clientUrl],
            credentials: true,
        };
    }
    async handleConnection(client: Socket) {
        this.logger.debug(`New connection attempt: ${client.id}`);
        try {
            const user = await this.authStrategy.authenticate(client);
            client.data = user;
            await this.sessionService.handleConnection(user.id, client.id);
            this.logger.log(`Authenticated: ${user.email} (${client.id})`);

            const allUserRooms = await this.chatRoomService.getUserRooms(user.id);
            for (const room of allUserRooms) {
                await client.join(room.id);
            }
            this.logger.log(
                `User ${user.email} (${user.id}) joined ${allUserRooms.length} chat rooms.`,
            );

            client.emit(SOCKET_EVENTS.CONNECTION_SUCCESS, {
                status: 'connected',
                userId: user.id,
                message: 'Authentication successful',
            });
        } catch (error: unknown) {
            if (error instanceof WsException) {
                this.logger.error(`Authentication failed: ${error.message}`);

                client.emit(SOCKET_EVENTS.CONNECTION_ERROR, {
                    code: 'AUTH_FAILED',
                    message: error.message,
                });

                setTimeout(() => client.disconnect(), 100);
            }
        }
    }

    async handleDisconnect(client: Socket) {
        try {
            await this.sessionService.handleDisconnect(client.id);
        } catch (error: unknown) {
            if (error instanceof WsException) {
                this.logger.error(`Disconnect error: ${error.message}`);
                client.emit(SOCKET_EVENTS.DISCONNECT_ERROR, {
                    message: 'Failed to clean session',
                });
            }
        }
    }

    @SubscribeMessage(MESSAGE_EVENT.SEND_MESSAGE)
    async handleSendMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody(new ZodValidationPipe(SendMessageGatewayDto)) dto: SendMessageGatewayDto,
    ) {
        const { receiverId, content } = dto;
        const sender = client.data as SafeUser;
        this.logger.debug(`Received message from ${sender.email} to ${receiverId}`);

        const room = await this.chatRoomService.findOrCreatePrivateRoom(sender.id, receiverId);

        const savedMessage = await this.messageService.saveMessage({
            userId: sender.id,
            chatRoomId: room.id,
            content,
        });

        this.server.to(room.id).emit(MESSAGE_EVENT.NEW_MESSAGE, savedMessage);
        this.logger.log(`Message sent to room ${room.id}`);
    }

    @OnEvent('friendship.rejected')
    async handleFriendshipRejected(payload: Friendship) {
        this.logger.log(`Friendship rejected event for user ${payload.requesterId}`);
        const requesterSockets = await this.sessionService.getUserSockets(payload.requesterId);
        for (const socketId of requesterSockets) {
            this.server.to(socketId).emit(FRIENDSHIP_EVENT.FRIENDSHIP_REQUEST_REJECTED, {
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
        const notifiedUserSockets = await this.sessionService.getUserSockets(payload.notifiedUser);
        for (const socketId of notifiedUserSockets) {
            this.server.to(socketId).emit(FRIENDSHIP_EVENT.FRIENDSHIP_DELETED, {
                friendshipId: payload.friendshipId,
            });
        }
    }

    @OnEvent('friendship.requested')
    async handleFriendshipRequested(payload: Friendship) {
        this.logger.log(`Friendship request event for user ${payload.addresseeId}`);
        const receiverSockets = await this.sessionService.getUserSockets(payload.addresseeId);
        for (const socketId of receiverSockets) {
            this.server.to(socketId).emit(FRIENDSHIP_EVENT.FRIENDSHIP_REQUEST_RECEIVED, payload);
        }
    }

    @OnEvent('friendship.accepted')
    async handleFriendshipAccepted(payload: Friendship) {
        this.logger.log(`Friendship accepted event for user ${payload.requesterId}`);
        const requesterSockets = await this.sessionService.getUserSockets(payload.requesterId);
        for (const socketId of requesterSockets) {
            this.server.to(socketId).emit(FRIENDSHIP_EVENT.FRIENDSHIP_REQUEST_ACCEPTED, payload);
        }
    }
}
