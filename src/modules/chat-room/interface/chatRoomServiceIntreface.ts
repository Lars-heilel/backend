import { ChatRoom } from '@prisma/generated/client';
export const CHAT_ROOM_SERVICE_INTERFACE = Symbol('CHAT_ROOM_SERVICE_INTERFACE');
export interface ChatRoomServiceInterface {
    findOrCreatePrivateRoom(firstUserId: string, secondUserId: string): Promise<ChatRoom>;
    getUserRooms(userId: string): Promise<ChatRoom[]>;
    isUserInRoom(userId: string, roomId: string): Promise<boolean>;
}
