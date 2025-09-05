import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { NestjsJwtModule } from 'src/core/security/jwt/nestjs-jwt/nestjs-jwt.module';
import { WsSessionRepository } from './repository/ws-session.cacheManager.repository';
import { WsAuthStrategy } from './stratrgy/ws-auth.stategy';
import { PrismaModule } from '@prisma/prisma.module';
import { MessageModule } from '../message/message.module';
import { WS_SESSION_INRERFACE } from './interface/wsSessionRepoInterface';
import { SESSION_SERVICE_INTERFACE } from './interface/sessionServiceInterface';
import { SessionService } from './session.service';
import { AppGateway } from './app.gateway';
import { ChatRoomModule } from '../chat-room/chat-room.module';

@Module({
    providers: [
        AppGateway,
        WsAuthStrategy,
        { provide: WS_SESSION_INRERFACE, useClass: WsSessionRepository },
        { provide: SESSION_SERVICE_INTERFACE, useClass: SessionService },
    ],
    imports: [UsersModule, NestjsJwtModule, PrismaModule, MessageModule, ChatRoomModule],
})
export class AppGatewayModule {}
