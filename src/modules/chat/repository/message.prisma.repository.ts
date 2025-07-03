import { Injectable } from '@nestjs/common';
import { MessageAbstract } from '../interface/message.abstract';
import { Message } from '@prisma/generated/client';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class MessagePrismaRepository extends MessageAbstract {
    constructor(private prisma: PrismaService) {
        super();
    }
    async saveMessage(senderId: string, receiverId: string, content: string): Promise<Message> {
        return await this.prisma.message.create({ data: { senderId, receiverId, content } });
    }
    async getHistory(
        userId: string,
        secondUserId: string,
        limit: number,
        cursor: { id: string; createAt: Date } | null,
    ): Promise<Message[]> {
        return await this.prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId, receiverId: secondUserId },
                    { senderId: secondUserId, receiverId: userId },
                ],
            },
            cursor: cursor ? { id: cursor.id } : undefined,
            skip: cursor ? 1 : 0,
            take: limit,
            orderBy: [{ createAt: 'desc' }, { id: 'desc' }],
        });
    }
    async markAsRead(): Promise<void> {}
}
