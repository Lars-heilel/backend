import { Inject, Injectable, Logger } from '@nestjs/common';
import { ChatRoom } from '@prisma/generated/client';
import { CHAT_ROOM_REPO_INTERFACE, ChatRoomRepoInterface } from './interface/chatRoomRepoInterface';
import { CreatePrivateRoomDto, GetUserRoomsDto, isUserInRoomDto } from './DTO';
import { ChatRoomServiceInterface } from './interface/chatRoomServiceIntreface';

@Injectable()
export class ChatRoomService implements ChatRoomServiceInterface {
    private readonly logger = new Logger(ChatRoomService.name);

    constructor(
        @Inject(CHAT_ROOM_REPO_INTERFACE)
        private readonly chatRoomRepo: ChatRoomRepoInterface,
    ) {}

    async findOrCreatePrivateRoom(dto: CreatePrivateRoomDto): Promise<ChatRoom> {
        const { firstUserId, secondUserId } = dto;
        this.logger.debug(`Searching for a room between ${firstUserId} and ${secondUserId}`);
        const existingRoom = await this.chatRoomRepo.findPrivateRoomByUsers(
            firstUserId,
            secondUserId,
        );
        if (existingRoom) {
            this.logger.debug(`Found existing room: ${existingRoom.id}`);
            return existingRoom;
        }

        this.logger.log(`No existing room found. Creating a new one...`);
        return this.chatRoomRepo.createPrivateRoom(firstUserId, secondUserId);
    }

    async getUserRooms(dto: GetUserRoomsDto): Promise<ChatRoom[]> {
        const { userId } = dto;
        this.logger.debug(`Fetching all rooms for user ${userId}`);
        return this.chatRoomRepo.getUserRooms(userId);
    }

    async isUserInRoom(dto: isUserInRoomDto): Promise<boolean> {
        const { userId, roomId } = dto;
        this.logger.debug(`Checking if user ${userId} is in room ${roomId}`);
        return this.chatRoomRepo.isUserInRoom(userId, roomId);
    }
}
