import { Inject, Injectable } from '@nestjs/common';
import { MessageServiceInterface } from './interface/messageServiceIntreface';
import { Message } from '@prisma/generated/client';
import { SaveMessageDto } from './DTO/saveMessage.dto';
import { MESSAGE_REPO_INTERFACE, MessageRepoInterface } from './interface/messageRepoInterface';
import { HistoryDto } from './DTO/history.dto';

@Injectable()
export class MessageService implements MessageServiceInterface {
    constructor(
        @Inject(MESSAGE_REPO_INTERFACE) private readonly messageRepo: MessageRepoInterface,
    ) {}
    async saveMessage(dto: SaveMessageDto): Promise<Message> {
        return await this.messageRepo.saveMessage(dto);
    }
    async getHistory(dto: HistoryDto): Promise<Message[]> {
        return await this.messageRepo.getHistory(dto);
    }
}
