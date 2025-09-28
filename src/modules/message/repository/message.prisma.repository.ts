import { Injectable } from '@nestjs/common';
import { Message } from '@prisma/generated/client';
import { PrismaService } from '@prisma/prisma.service';
import { MessageRepoInterface } from '../interface/messageRepoInterface';
import { SaveMessageDto } from '../DTO/saveMessage.dto';
import { HistoryDto } from '@src/modules/message/DTO/history.dto';
import { USER_SELECT_FIELDS } from '@src/modules/users/const/user.prisma.constants';

@Injectable()
export class MessagePrismaRepository implements MessageRepoInterface {
    constructor(private prisma: PrismaService) {}
    async saveMessage({ userId, chatRoomId, content }: SaveMessageDto): Promise<Message> {
        return await this.prisma.message.create({
            data: { senderId: userId, chatRoomId, content },
            include: { sender: { select: USER_SELECT_FIELDS } },
        });
    }
    async getHistory({
        chatRoomId,
        lastMessageId,
        lastMessageCreatedAt,
        limit,
    }: HistoryDto): Promise<Message[]> {
        const cursor =
            lastMessageId && lastMessageCreatedAt
                ? {
                      createAt_id: {
                          createAt: new Date(lastMessageCreatedAt),
                          id: lastMessageId,
                      },
                  }
                : undefined;

        return await this.prisma.message.findMany({
            where: { chatRoomId },
            cursor,
            skip: cursor ? 1 : 0,
            take: limit,
            orderBy: [{ createAt: 'desc' }, { id: 'desc' }],
            include: { sender: { select: USER_SELECT_FIELDS } },
        });
    }
}
