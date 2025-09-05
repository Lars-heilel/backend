import { Module } from '@nestjs/common';
import { CHAT_ROOM_REPO_INTERFACE } from './interface/chatRoomRepoInterface';
import { ChatRoomRepository } from './repository/chatRoom.prisma.repository';
import { CHAT_ROOM_SERVICE_INTERFACE } from './interface/chatRoomServiceIntreface';
import { ChatRoomService } from './chat-room.service';

@Module({
    providers: [
        { provide: CHAT_ROOM_REPO_INTERFACE, useClass: ChatRoomRepository },
        { provide: CHAT_ROOM_SERVICE_INTERFACE, useClass: ChatRoomService },
    ],
})
export class ChatRoomModule {}
