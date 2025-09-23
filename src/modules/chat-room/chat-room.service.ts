import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { ChatRoom } from '@prisma/generated/client';
import { CHAT_ROOM_REPO_INTERFACE, ChatRoomRepoInterface } from './interface/chatRoomRepoInterface';
import { ChatRoomServiceInterface } from './interface/chatRoomServiceIntreface';
import { AllChatRoomReturnDto } from './DTO/all-chatroom-return.dto';

@Injectable()
export class ChatRoomService implements ChatRoomServiceInterface {
    private readonly logger = new Logger(ChatRoomService.name);

    constructor(
        @Inject(CHAT_ROOM_REPO_INTERFACE)
        private readonly chatRoomRepo: ChatRoomRepoInterface,
    ) {}

    async findOrCreatePrivateRoom(firstUserId: string, secondUserId: string): Promise<ChatRoom> {
        if (firstUserId === secondUserId) {
            this.logger.warn(`Attempt to create a chat room with oneself: ${firstUserId}`);
            throw new BadRequestException('Cannot create a chat room with yourself.');
        }

        this.logger.debug(`Searching for a room between ${firstUserId} and ${secondUserId}`);
        const existingRoom = await this.chatRoomRepo.findPrivateRoomByUsers(
            firstUserId,
            secondUserId,
        );

        if (existingRoom) {
            this.logger.debug(`Found existing room: ${existingRoom.id}`);
            return existingRoom;
        }

        this.logger.log(
            `No existing room found. Creating a new one for ${firstUserId} and ${secondUserId}`,
        );
        return await this.chatRoomRepo.createPrivateRoom(firstUserId, secondUserId);
    }

    async getUserRooms(userId: string): Promise<AllChatRoomReturnDto[]> {
        this.logger.debug(`Fetching all rooms for user ${userId}`);
        const dbResponse = await this.chatRoomRepo.getUserRooms(userId);
        const restructuredData = dbResponse.flatMap((room) => {
            const participantData = room.participants.find((p) => p.userId !== userId);
            if (!participantData) {
                this.logger.warn(`Room ${room.id} for user ${userId} has no other participant.`);
                return [];
            }
            return {
                id: room.id,
                updatedAt: room.updatedAt,
                participant: participantData.user,
                lastMessage: room.messages[0] || null,
                unreadCount: room._count.messages,
            };
        });
        return restructuredData;
    }

    async isUserInRoom(userId: string, roomId: string): Promise<boolean> {
        this.logger.debug(`Checking if user ${userId} is in room ${roomId}`);
        return await this.chatRoomRepo.isUserInRoom(userId, roomId);
    }
}
