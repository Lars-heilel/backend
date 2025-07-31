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
import { ZodValidationPipe } from 'src/common/pipes/zod.validation.pipe';
import { SendMessageSchema } from './DTO/sendMessage.dto';
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
}
