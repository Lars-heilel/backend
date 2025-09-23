import { ChatRoom } from '@prisma/generated/client';
import { ChatRoomWithDetails } from '../types/prisma.types';

export const CHAT_ROOM_REPO_INTERFACE = Symbol('CHAT_ROOM_REPO_INTERFACE');
export interface ChatRoomRepoInterface {
    createPrivateRoom(userId1: string, userId2: string): Promise<ChatRoom>;
    findPrivateRoomByUsers(userId1: string, userId2: string): Promise<ChatRoom | null>;
    getUserRooms(userId: string): Promise<ChatRoomWithDetails[]>;
    isUserInRoom(userId: string, roomId: string): Promise<boolean>;
}
