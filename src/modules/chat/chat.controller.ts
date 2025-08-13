import { Controller, Get, Query, UseGuards, UsePipes, HttpStatus } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Message } from '@prisma/generated/client';
import { HistoriSchema, HistoryDto } from './DTO/history.dto';
import {ZodValidationPipe} from 'nestjs-zod';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @Get('history')
    @ApiOperation({ summary: 'Get chat history between two users' })
    @ApiBearerAuth('access-token')
    @ApiQuery({
        name: 'userId',
        type: String,
        description: 'ID of the user requesting the chat history',
        example: 'user123',
    })
    @ApiQuery({
        name: 'secondUserId',
        type: String,
        description: 'ID of the second user in the chat',
        example: 'user456',
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
    async getChatHistory(@Query() dto: HistoryDto): Promise<Message[]> {
        return await this.chatService.getChatHistory(dto);
    }
}
