import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MESSAGE_REPO_INTERFACE } from './interface/messageRepoInterface';
import { MessagePrismaRepository } from './repository/message.prisma.repository';
import { MESSAGE_SERVICE_INTERFACE } from './interface/messageServiceIntreface';
import { MessageController } from './message.controller';
import { PrismaModule } from '@prisma/prisma.module';
import { ChatRoomModule } from '../chat-room/chat-room.module';
@Module({
    providers: [
        { provide: MESSAGE_SERVICE_INTERFACE, useClass: MessageService },
        { provide: MESSAGE_REPO_INTERFACE, useClass: MessagePrismaRepository },
    ],
    imports: [PrismaModule, ChatRoomModule],
    controllers: [MessageController],
    exports: [MESSAGE_SERVICE_INTERFACE],
})
export class MessageModule {}
