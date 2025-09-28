import { Inject, Injectable, Logger } from '@nestjs/common';
import { MessageServiceInterface } from './interface/messageServiceIntreface';
import { Message } from '@prisma/generated/client';
import { SaveMessageDto } from './DTO/saveMessage.dto';
import { MESSAGE_REPO_INTERFACE, MessageRepoInterface } from './interface/messageRepoInterface';
import { HistoryDto } from './DTO/history.dto';

@Injectable()
export class MessageService implements MessageServiceInterface {
    private readonly logger = new Logger(MessageService.name);
    constructor(
        @Inject(MESSAGE_REPO_INTERFACE) private readonly messageRepo: MessageRepoInterface,
    ) {}
    async saveMessage(dto: SaveMessageDto): Promise<Message> {
        return await this.messageRepo.saveMessage(dto);
    }
    async getHistory(dto: HistoryDto): Promise<Message[]> {
        const messageArray = await this.messageRepo.getHistory(dto);
        this.logger.debug(`длинна массива ${messageArray.length}`);
        return messageArray;
    }
}
