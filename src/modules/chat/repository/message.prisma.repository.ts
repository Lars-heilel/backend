import { Injectable } from '@nestjs/common';
import { MessageAbstract } from '../interface/message.abstract';
import { Message } from '@prisma/generated/client';
import { PrismaService } from '@prisma/prisma.service';
import { HistoryDto } from '../DTO/history.dto';

@Injectable()
export class MessagePrismaRepository extends MessageAbstract {
    constructor(private prisma: PrismaService) {
        super();
    }
    async saveMessage(senderId: string, receiverId: string, content: string): Promise<Message> {
        return await this.prisma.message.create({ data: { senderId, receiverId, content } });
    }
    async getHistory(dto: HistoryDto): Promise<Message[]> {
        const { userId, secondUserId, cursor, limit } = dto;
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
