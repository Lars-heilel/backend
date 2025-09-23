import { Injectable } from '@nestjs/common';
import { ChatRoomRepoInterface } from '../interface/chatRoomRepoInterface';
import { ChatRoom } from '@prisma/generated/client';
import { PrismaService } from '@prisma/prisma.service';
import { USER_SELECT_FIELDS } from '@src/modules/users/const/user.prisma.constants';
import { ChatRoomWithDetails } from '../types/prisma.types';

@Injectable()
export class ChatRoomRepository implements ChatRoomRepoInterface {
    constructor(private readonly prisma: PrismaService) {}

    async createPrivateRoom(userId1: string, userId2: string): Promise<ChatRoom> {
        return this.prisma.chatRoom.create({
            data: {
                participants: {
                    create: [{ userId: userId1 }, { userId: userId2 }],
                },
            },
        });
    }

    async findPrivateRoomByUsers(userId1: string, userId2: string): Promise<ChatRoom | null> {
        return this.prisma.chatRoom.findFirst({
            where: {
                AND: [
                    { participants: { some: { userId: userId1 } } },
                    { participants: { some: { userId: userId2 } } },
                ],
                NOT: {
                    participants: {
                        some: {
                            userId: { notIn: [userId1, userId2] },
                        },
                    },
                },
            },
        });
    }

    async getUserRooms(userId: string): Promise<ChatRoomWithDetails[]> {
        return this.prisma.chatRoom.findMany({
            where: {
                AND: [
                    {
                        participants: {
                            some: {
                                userId: userId,
                            },
                        },
                    },
                    {
                        participants: {
                            some: {
                                userId: { not: userId },
                                user: {
                                    OR: [
                                        {
                                            sendRequest: {
                                                some: {
                                                    addresseeId: userId,
                                                    status: 'ACCEPTED',
                                                },
                                            },
                                        },
                                        {
                                            receivedRequests: {
                                                some: {
                                                    requesterId: userId,
                                                    status: 'ACCEPTED',
                                                },
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    },
                ],
            },
            include: {
                participants: { include: { user: { select: USER_SELECT_FIELDS } } },
                messages: { orderBy: { createAt: 'desc' }, take: 1 },
                _count: {
                    select: { messages: { where: { read: false, senderId: { not: userId } } } },
                },
            },
        });
    }

    async isUserInRoom(userId: string, roomId: string): Promise<boolean> {
        const participant = await this.prisma.chatRoomParticipant.findUnique({
            where: {
                userId_chatRoomId: {
                    userId: userId,
                    chatRoomId: roomId,
                },
            },
        });
        return !!participant;
    }
}
