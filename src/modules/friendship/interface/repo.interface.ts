import { Friendship, FriendshipStatus } from '@prisma/generated/client';
export const FRIENDSHIP_REPOSITORY = Symbol('FRIENDSHIP_REPOSITORY');
export interface IFriendshipRepository {
    createRequest(requesterId: string, addresseeId: string): Promise<Friendship>;
    findExistingRequests(user1: string, user2: string): Promise<Friendship[]>;
    findFriendshipById(id: string): Promise<Friendship | null>;
    updateStatus(id: string, status: FriendshipStatus): Promise<Friendship>;
    delete(id: string): Promise<void>;
    getIncomingRequests(userId: string): Promise<Friendship[]>;
    getFriendList(userId: string): Promise<Friendship[]>;
    findActiveFriendship(
        firstUserId: string,
        secondUserId: string,
    ): Promise<Pick<Friendship, 'status'> | null>;
}
