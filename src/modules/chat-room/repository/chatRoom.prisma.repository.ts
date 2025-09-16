import { Injectable } from '@nestjs/common';
import { ChatRoomRepoInterface } from '../interface/chatRoomRepoInterface';
import { ChatRoom } from '@prisma/generated/client';
import { PrismaService } from '@prisma/prisma.service';

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

    async getUserRooms(userId: string): Promise<ChatRoom[]> {
        return this.prisma.chatRoom.findMany({
            where: {
                participants: {
                    some: { userId: userId },
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
