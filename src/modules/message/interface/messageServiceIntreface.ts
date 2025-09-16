import { Message } from '@prisma/generated/client';
import { HistoryDto } from '../DTO/history.dto';
import { SaveMessageDto } from '../DTO/saveMessage.dto';

export const MESSAGE_SERVICE_INTERFACE = Symbol('MESSAGE_SERVICE_INTERFACE');

export interface MessageServiceInterface {
    saveMessage(dto: SaveMessageDto): Promise<Message>;
    getHistory(dto: HistoryDto): Promise<Message[]>;
    // markAsRead(messageId: string, userId: string): Promise<void>;
}
