import {
    ConflictException,
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { FriendshipRepositoryAbstract } from './repo/friendship.repository.abstract';

@Injectable()
export class FriendshipService {
    private readonly logger = new Logger(FriendshipService.name);

    constructor(private readonly repository: FriendshipRepositoryAbstract) {}

    async sendRequest(requesterId: string, addresseeId: string) {
        this.logger.debug(`Sending friend request from ${requesterId} to ${addresseeId}`);

        try {
            if (requesterId === addresseeId) {
                this.logger.warn(`Self-request attempt by ${requesterId}`);
                throw new ConflictException('Cannot send request to yourself');
            }

            this.logger.verbose(
                `Checking existing requests between ${requesterId} and ${addresseeId}`,
            );
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
                this.logger.warn(
                    `Friendship already exists between ${requesterId} and ${addresseeId}`,
                );
                throw new ConflictException('Already friends');
            }

            this.logger.verbose(`Creating new friend request`);
            const request = await this.repository.createRequest(requesterId, addresseeId);

            this.logger.log(
                `Friend request created (ID: ${request.id}) from ${requesterId} to ${addresseeId}`,
            );
            return request;
        } catch (error) {
            this.logger.error(`Failed to send friend request`, {
                requesterId,
                addresseeId,
                error: error.message,
            });

            if (error instanceof ConflictException) throw error;
            throw new InternalServerErrorException('Friend request failed');
        }
    }

    async incomingRequest(userId: string) {
        this.logger.debug(`Fetching incoming requests for user: ${userId}`);

        try {
            const requests = await this.repository.getIncomingRequests(userId);
            this.logger.verbose(`Found ${requests.length} incoming requests for ${userId}`);
            return requests;
        } catch (error) {
            this.logger.error(`Failed to fetch incoming requests for ${userId}`, {
                error: error.message,
            });
            throw new InternalServerErrorException('Failed to load requests');
        }
    }

    async updateFriendshipStatus(
        friendshipId: string,
        userId: string,
        type: 'ACCEPTED' | 'REJECTED',
    ) {
        this.logger.debug(`Updating friendship ${friendshipId} to ${type} by user ${userId}`);

        try {
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

                this.logger.log(`Request rejected: ${friendshipId}`);
                return { message: 'Request rejected' };
            }

            this.logger.verbose(`Accepting request ${friendshipId}`);
            const result = await this.repository.updateStatus(friendshipId, type);

            this.logger.log(
                `Friendship accepted: ${friendshipId} between ${request.requesterId} and ${request.addresseeId}`,
            );
            return result;
        } catch (error) {
            this.logger.error(`Failed to update friendship status`, {
                friendshipId,
                userId,
                type,
                error: error.message,
            });

            if (
                error instanceof NotFoundException ||
                error instanceof ForbiddenException ||
                error instanceof ConflictException
            ) {
                throw error;
            }
            throw new InternalServerErrorException('Friendship update failed');
        }
    }
    async deleteFriendship(friendshipId: string, userId: string) {
        this.logger.debug(`Deleting friendship ${friendshipId} by user ${userId}`);
        try {
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
            await this.repository.delete(friendshipId);
            this.logger.log(`Friendship deleted: ${friendshipId}`);
        } catch (error) {
            this.logger.error(`Failed to delete friendship ${friendshipId}`, {
                error: error.message,
            });
            if (error instanceof ForbiddenException || error instanceof NotFoundException)
                throw error;
            throw new InternalServerErrorException('Failed to delete friendship');
        }
    }
}
