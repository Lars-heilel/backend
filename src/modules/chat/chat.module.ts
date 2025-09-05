import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { UsersModule } from '../users/users.module';
import { NestjsJwtModule } from 'src/core/security/jwt/nestjs-jwt/nestjs-jwt.module';
import { WsSessionRepository } from './repository/ws-session.cacheManager.repository';
import { WsSessionAbstract } from './interface/ws-sessoin.abstract';
import { WsAuthStrategy } from './stratrgy/ws-auth.stategy';
import { PrismaModule } from '@prisma/prisma.module';
import { MessageModule } from '../message/message.module';

@Module({
    providers: [
        ChatGateway,
        ChatService,
        WsAuthStrategy,
        { provide: WsSessionAbstract, useClass: WsSessionRepository },
    ],
    imports: [UsersModule, NestjsJwtModule, PrismaModule, MessageModule],
})
export class ChatModule {}
