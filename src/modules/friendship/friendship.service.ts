import {
    ConflictException,
    ForbiddenException,
    Inject,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { Friendship } from '@prisma/generated/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FRIENDSHIP_REPOSITORY, IFriendshipRepository } from './interface/repo.interface';
import { IFriendshipService } from './interface/service.interface';

@Injectable()
export class FriendshipService implements IFriendshipService {
    private readonly logger = new Logger(FriendshipService.name);

    constructor(
        @Inject(FRIENDSHIP_REPOSITORY)
        private readonly repository: IFriendshipRepository,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    async sendRequest(requesterId: string, addresseeId: string): Promise<Friendship> {
        this.logger.debug(`Sending friend request from ${requesterId} to ${addresseeId}`);

        if (requesterId === addresseeId) {
            this.logger.warn(`Self-request attempt by ${requesterId}`);
            throw new ConflictException('Cannot send request to yourself');
        }

        this.logger.verbose(`Checking existing requests between ${requesterId} and ${addresseeId}`);
        const existingRequests = await this.repository.findExistingRequests(
            requesterId,
            addresseeId,
        );

        const activeRequest = existingRequests.find((r) => r.status === 'PENDING');
        if (activeRequest) {
            this.logger.warn(`Active request already exists (ID: ${activeRequest.id})`);
            throw new ConflictException('Friend request already exists');
        }

        if (existingRequests.some((r) => r.status === 'ACCEPTED')) {
            this.logger.warn(`Friendship already exists between ${requesterId} and ${addresseeId}`);
            throw new ConflictException('Already friends');
        }

        this.logger.verbose(`Creating new friend request`);
        const request = await this.repository.createRequest(requesterId, addresseeId);

        this.eventEmitter.emit('friendship.requested', request);
        this.logger.log(
            `Friend request created (ID: ${request.id}) from ${requesterId} to ${addresseeId}`,
        );
        return request;
    }

    async incomingRequest(userId: string): Promise<Friendship[]> {
        this.logger.debug(`Fetching incoming requests for user: ${userId}`);

        const requests = await this.repository.getIncomingRequests(userId);
        this.logger.verbose(`Found ${requests.length} incoming requests for ${userId}`);
        return requests;
    }

    async updateFriendshipStatus(
        friendshipId: string,
        userId: string,
        type: 'ACCEPTED' | 'REJECTED',
    ): Promise<Friendship | { message: string }> {
        this.logger.debug(`Updating friendship ${friendshipId} to ${type} by user ${userId}`);

        this.logger.verbose(`Fetching request ${friendshipId}`);
        const request = await this.repository.findFriendshipById(friendshipId);

        if (!request) {
            this.logger.warn(`Request not found: ${friendshipId}`);
            throw new NotFoundException('Request not found');
        }

        if (request.addresseeId !== userId) {
            this.logger.warn(`Permission denied for user ${userId} on request ${friendshipId}`);
            throw new ForbiddenException('No permission');
        }

        if (request.status === 'ACCEPTED') {
            this.logger.warn(`Request already accepted: ${friendshipId}`);
            throw new ConflictException('Request already accepted');
        }

        if (type === 'REJECTED') {
            this.logger.verbose(`Rejecting request ${friendshipId}`);
            await this.repository.delete(friendshipId);
            this.eventEmitter.emit('friendship.rejected', request);
            this.logger.log(`Request rejected: ${friendshipId}`);
            return { message: 'Request rejected' };
        }

        this.logger.verbose(`Accepting request ${friendshipId}`);
        const result = await this.repository.updateStatus(friendshipId, type);
        this.eventEmitter.emit('friendship.accepted', result);
        this.logger.log(
            `Friendship accepted: ${friendshipId} between ${request.requesterId} and ${request.addresseeId}`,
        );
        return result;
    }
    async deleteFriendship(friendshipId: string, userId: string): Promise<void> {
        this.logger.debug(`Deleting friendship ${friendshipId} by user ${userId}`);
        const friendship = await this.repository.findFriendshipById(friendshipId);
        if (!friendship) {
            this.logger.warn(`Friendship not found: ${friendshipId}`);
            throw new NotFoundException('Friendship not found');
        }
        if (friendship.addresseeId !== userId && friendship.requesterId !== userId) {
            this.logger.debug(
                `Адрессат ${friendship.addresseeId},Отправитель ${friendship.requesterId}`,
            );
            this.logger.warn(
                `User ${userId} has no permission to delete friendship ${friendshipId}`,
            );
            throw new ForbiddenException('You are not a participant of this friendship');
        }
        const notifiedUserId =
            friendship.requesterId === userId ? friendship.addresseeId : friendship.requesterId;
        await this.repository.delete(friendshipId);
        this.eventEmitter.emit('friendship.deleted', {
            deletedBy: userId,
            notifiedUser: notifiedUserId,
            friendshipId: friendship.id,
        });
        this.logger.log(`Friendship deleted: ${friendshipId}`);
    }
    async validateByAcceptedStatus(
        firstUserId: string,
        secondUserId: string,
    ): Promise<Pick<Friendship, 'status'>> {
        const friendship = await this.repository.findActiveFriendship(firstUserId, secondUserId);
        if (!friendship) {
            throw new ConflictException(`Friendship does not exist`);
        }
        return friendship;
    }

    async getfirendlist(userId: string): Promise<Friendship[]> {
        this.logger.debug(`Fetching friend list`);
        const friends = await this.repository.getFriendList(userId);
        this.logger.verbose(`Found ${friends.length} friends`);
        return friends;
    }
}
