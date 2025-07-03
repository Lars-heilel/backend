import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { UsersModule } from '../users/users.module';
import { NestjsJwtModule } from 'src/core/security/jwt/nestjs-jwt/nestjs-jwt.module';
import { WsSessionRepository } from './repository/ws-session.cacheManager.repository';
import { WsSessionAbstract } from './interface/ws-sessoin.abstract';
import { WsAuthStrategy } from './stratrgy/ws-auth.stategy';
import { MessageAbstract } from './interface/message.abstract';
import { MessagePrismaRepository } from './repository/message.prisma.repository';
import { PrismaModule } from '@prisma/prisma.module';
import { FriendshipModule } from '../friendship/friendship.module';

@Module({
    providers: [
        ChatGateway,
        ChatService,
        WsAuthStrategy,
        { provide: MessageAbstract, useClass: MessagePrismaRepository },
        { provide: WsSessionAbstract, useClass: WsSessionRepository },
    ],
    imports: [UsersModule, NestjsJwtModule, PrismaModule, FriendshipModule],
})
export class ChatModule {}
