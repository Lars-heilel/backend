import { Message } from '@prisma/generated/client';

export abstract class MessageAbstract {
    abstract saveMessage(senderId: string, receiverId: string, content: string): Promise<Message>;
    abstract getHistory(
        userId: string,
        secondUserId: string,
        limit: number,
        cursor: { id: string; createAt: Date } | null,
    ): Promise<Message[]>;
    abstract markAsRead(): Promise<void>;
}
