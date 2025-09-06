import { Module } from '@nestjs/common';
import { CHAT_ROOM_REPO_INTERFACE } from './interface/chatRoomRepoInterface';
import { ChatRoomRepository } from './repository/chatRoom.prisma.repository';
import { CHAT_ROOM_SERVICE_INTERFACE } from './interface/chatRoomServiceIntreface';
import { ChatRoomService } from './chat-room.service';
import { PrismaModule } from '@prisma/prisma.module';
import { ChatRoomController } from './chat-room.controller';

@Module({
    providers: [
        { provide: CHAT_ROOM_REPO_INTERFACE, useClass: ChatRoomRepository },
        { provide: CHAT_ROOM_SERVICE_INTERFACE, useClass: ChatRoomService },
    ],
    imports: [PrismaModule],
    controllers: [ChatRoomController],
    exports: [CHAT_ROOM_SERVICE_INTERFACE],
})
export class ChatRoomModule {}
