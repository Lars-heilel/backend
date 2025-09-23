import { ChatRoom } from '@prisma/generated/client';
import { AllChatRoomReturnDto } from '../DTO/all-chatroom-return.dto';
export const CHAT_ROOM_SERVICE_INTERFACE = Symbol('CHAT_ROOM_SERVICE_INTERFACE');
export interface ChatRoomServiceInterface {
    findOrCreatePrivateRoom(firstUserId: string, secondUserId: string): Promise<ChatRoom>;
    getUserRooms(userId: string): Promise<AllChatRoomReturnDto[]>;
    isUserInRoom(userId: string, roomId: string): Promise<boolean>;
}
