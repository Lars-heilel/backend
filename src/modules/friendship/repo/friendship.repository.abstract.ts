import { Friendship, FriendshipStatus } from '@prisma/generated/client';

export abstract class FriendshipRepositoryAbstract {
    abstract createRequest(requesterId: string, addresseeId: string): Promise<Friendship>;
    abstract findExistingRequests(user1: string, user2: string): Promise<Friendship[]>;
    abstract findFriendshipById(id: string): Promise<Friendship | null>;
    abstract updateStatus(id: string, status: FriendshipStatus): Promise<Friendship>;
    abstract delete(id: string): Promise<void>;
    abstract getIncomingRequests(userId: string): Promise<Friendship[]>;
    abstract getFriendList(userId: string): Promise<Friendship[]>;
    abstract findActiveFriendship(
        firstUserId: string,
        secondUserId: string,
    ): Promise<Pick<Friendship, 'status'> | null>;
}
