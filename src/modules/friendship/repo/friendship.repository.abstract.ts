import { Friendship, FriendshipStatus } from 'prisma/generated';

export abstract class FriendshipRepositoryAbstract {
    abstract createRequest(requesterId: string, addresseeId: string): Promise<Friendship>;
    abstract findExistingRequests(user1: string, user2: string): Promise<Friendship[]>;
    abstract findFriendshipById(id: string): Promise<Friendship | null>;
    abstract updateStatus(id: string, status: FriendshipStatus): Promise<Friendship>;
    abstract delete(id: string): Promise<void>;
    abstract getIncomingRequests(userId: string): Promise<Friendship[]>;
}
