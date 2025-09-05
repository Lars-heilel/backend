import { ChatRoom } from '@prisma/generated/client';
import { CreatePrivateRoomDto, GetUserRoomsDto, isUserInRoomDto } from '../DTO';
export const CHAT_ROOM_SERVICE_INTERFACE = Symbol('CHAT_ROOM_SERVICE_INTERFACE');
export interface ChatRoomServiceInterface {
    findOrCreatePrivateRoom(dto: CreatePrivateRoomDto): Promise<ChatRoom>;
    getUserRooms(dto: GetUserRoomsDto): Promise<ChatRoom[]>;
    isUserInRoom(dto: isUserInRoomDto): Promise<boolean>;
}
