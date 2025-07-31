import { Message } from '@prisma/generated/client';
import { HistoryDto } from '../DTO/history.dto';

export abstract class MessageAbstract {
    abstract saveMessage(senderId: string, receiverId: string, content: string): Promise<Message>;
    abstract getHistory(dto: HistoryDto): Promise<Message[]>;
    abstract markAsRead(): Promise<void>;
}
