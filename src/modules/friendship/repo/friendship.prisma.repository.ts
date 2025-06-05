import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { FriendshipRepositoryAbstract } from './friendship.repository.abstract';
import { Friendship, FriendshipStatus } from 'prisma/generated';

@Injectable()
export class FriendshipPrismaRepository extends FriendshipRepositoryAbstract {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    async createRequest(requesterId: string, addresseeId: string): Promise<Friendship> {
        return this.prisma.friendship.create({
            data: { requesterId, addresseeId, status: 'PENDING' },
        });
    }

    async findExistingRequests(user1: string, user2: string): Promise<Friendship[]> {
        return this.prisma.friendship.findMany({
            where: {
                OR: [
                    { requesterId: user1, addresseeId: user2 },
                    { requesterId: user2, addresseeId: user1 },
                ],
            },
        });
    }

    async findFriendshipById(friendshipId: string): Promise<Friendship | null> {
        return this.prisma.friendship.findUnique({ where: { id: friendshipId } });
    }

    async updateStatus(id: string, status: FriendshipStatus): Promise<Friendship> {
        return this.prisma.friendship.update({
            where: { id },
            data: { status },
        });
    }

    async delete(id: string): Promise<void> {
        await this.prisma.friendship.delete({ where: { id } });
    }

    async getIncomingRequests(userId: string): Promise<Friendship[]> {
        return this.prisma.friendship.findMany({
            where: { addresseeId: userId, status: 'PENDING' },
        });
    }
}
