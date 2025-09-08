import { Controller, Get, Query, UseGuards, UsePipes, HttpStatus, Inject, Req } from '@nestjs/common';
import { Message } from '@prisma/generated/client';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { HistoriSchema, HistoryDto } from './DTO/history.dto';
import {
    MESSAGE_SERVICE_INTERFACE,
    MessageServiceInterface,
} from './interface/messageServiceIntreface';
import { JwtUser } from '../auth/tokens/types/jwt-req';

@ApiTags('Message')
@Controller('message')
export class MessageController {
    constructor(
        @Inject(MESSAGE_SERVICE_INTERFACE) private readonly messageService: MessageServiceInterface,
    ) {}
    @Get('history')
    @ApiOperation({ summary: 'Get chat history between two users' })
    @ApiBearerAuth('access-token')
    @ApiQuery({
        name: 'chatRoomId',
        type: String,
        description: 'ID of the chat room to retrieve history from',
        example: 'clx123abc456...',
    })
    @ApiQuery({
        name: 'limit',
        type: Number,
        description: 'Number of messages to retrieve (1-100)',
        example: 20,
        minimum: 1,
        maximum: 100,
    })
    @ApiQuery({
        name: 'cursor[id]',
        type: String,
        required: false,
        description: 'Optional: ID of the message to start fetching from (for pagination)',
        example: 'message789',
    })
    @ApiQuery({
        name: 'cursor[createAt]',
        type: Date,
        required: false,
        description:
            'Optional: Creation date of the message to start fetching from (for pagination)',
        example: '2023-10-27T10:00:00Z',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successfully retrieved chat history.',
        type: [HistoryDto],
    })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input parameters.' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized access.' })
    @UseGuards(AuthGuard('jwt'))
    @UsePipes(new ZodValidationPipe(HistoriSchema))
    async getChatHistory(
        @Query() dto: HistoryDto,
        @Req() req: { user: JwtUser },
    ): Promise<Message[]> {
        return await this.messageService.getHistory(dto);
    }
}
