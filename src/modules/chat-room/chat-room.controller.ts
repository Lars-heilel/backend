import { Controller, Get, HttpStatus, Inject, Query, UseGuards, UsePipes } from '@nestjs/common';
import {
    CHAT_ROOM_SERVICE_INTERFACE,
    ChatRoomServiceInterface,
} from './interface/chatRoomServiceIntreface';
import { AuthGuard } from '@nestjs/passport';
import { ZodValidationPipe } from 'nestjs-zod';
import { CreatePrivateRoomDto, CreatePrivateRoomSchema } from './DTO';
import { ApiOperation, ApiQuery, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { ChatRoomResponseDto } from './DTO/private-room-return.dto';
import { CurrentUser } from '@src/common/decorators/CurrentUser.decorator';
import { AllChatRoomReturnDto } from './DTO/all-chatroom-return.dto';

@Controller('chat-room')
export class ChatRoomController {
    constructor(
        @Inject(CHAT_ROOM_SERVICE_INTERFACE)
        private readonly chatRoomService: ChatRoomServiceInterface,
    ) {}
    @Get('private')
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({
        summary: 'Find or create a private chat room',
        description:
            'Retrieves an existing private chat room between the current user and a specified friend, or creates a new one if it does not exist.',
    })
    @ApiQuery({
        name: 'friendId',
        required: true,
        description: 'The unique identifier of the other user in the chat room.',
        example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
        type: String,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successfully found or created the private chat room.',
        type: ChatRoomResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized. The user is not authenticated.',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description:
            'Bad Request. The provided friendId is invalid or the same as the current user ID.',
    })
    @ApiSecurity('access-token')
    @UsePipes(new ZodValidationPipe(CreatePrivateRoomSchema))
    async findOrCreatePrivateChatRoom(
        @CurrentUser() currentUserId: string,
        @Query() dto: CreatePrivateRoomDto,
    ) {
        return await this.chatRoomService.findOrCreatePrivateRoom(currentUserId, dto.friendId);
    }

    @Get('list')
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({
        summary: 'Get all chat rooms for the current user',
        description:
            'Retrieves a list of all chat rooms the authenticated user is a participant of, formatted for client-side display.',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successfully retrieved the list of chat rooms.',
        type: [AllChatRoomReturnDto],
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized. The user is not authenticated.',
    })
    @ApiSecurity('access-token')
    async getMyChatRoomList(@CurrentUser() currentUserId: string): Promise<AllChatRoomReturnDto[]> {
        return await this.chatRoomService.getUserRooms(currentUserId);
    }
}
