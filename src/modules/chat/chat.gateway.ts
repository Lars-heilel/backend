import { OnGatewayConnection, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],

        credentials: true,
    },
})
export class ChatGateway implements OnGatewayConnection {
    private readonly logger = new Logger(ChatGateway.name);
    constructor(private readonly chatService: ChatService) {}
    @WebSocketServer() server: Server;

    handleConnection(client: Socket) {
        const userId = client.handshake.query.userId;
        this.logger.log(`${client.id}`);
        this.logger.debug(`id юзера из квери ${userId}`);
        client.emit('hello', { message: 'Connected!' });
    }
}
