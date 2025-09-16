import { Message } from '@prisma/generated/client';
import { HistoryDto } from '../DTO/history.dto';
import { SaveMessageDto } from '../DTO/saveMessage.dto';

export const MESSAGE_REPO_INTERFACE = Symbol('MESSAGE_REPO_INTERFACE');

export interface MessageRepoInterface {
    saveMessage(dto: SaveMessageDto): Promise<Message>;
    getHistory(dto: HistoryDto): Promise<Message[]>;
    // markAsRead(): Promise<void>;
}
