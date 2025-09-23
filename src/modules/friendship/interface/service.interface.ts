import { Friendship } from '@prisma/generated/client';

export const FRIENDSHIP_SERVICE = Symbol('FRIENDSHIP_SERVICE');

export interface IFriendshipService {
    sendRequest(requesterId: string, addresseeId: string): Promise<Friendship>;

    incomingRequest(userId: string): Promise<Friendship[]>;

    updateFriendshipStatus(
        friendshipId: string,
        userId: string,
        type: 'ACCEPTED' | 'REJECTED',
    ): Promise<Friendship | { message: string }>;

    deleteFriendship(friendshipId: string, userId: string): Promise<void>;

    validateByAcceptedStatus(
        firstUserId: string,
        secondUserId: string,
    ): Promise<Pick<Friendship, 'status'>>;

    getfirendlist(userId: string): Promise<Friendship[]>;
}
