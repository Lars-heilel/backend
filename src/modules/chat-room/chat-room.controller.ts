import {
    Controller,
    Get,
    HttpStatus,
    Inject,
    Query,
    Req,
    UseGuards,
    UsePipes,
} from '@nestjs/common';
import {
    CHAT_ROOM_SERVICE_INTERFACE,
    ChatRoomServiceInterface,
} from './interface/chatRoomServiceIntreface';
import { AuthGuard } from '@nestjs/passport';
import { JwtUser } from '../auth/tokens/types/jwt-req';
import { ZodValidationPipe } from 'nestjs-zod';
import { CreatePrivateRoomDto, CreatePrivateRoomSchema } from './DTO';
import { ApiOperation, ApiQuery, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { ChatRoomResponseDto } from './DTO/private-room-return.dto';

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
        @Req() currentUser: { user: JwtUser },
        @Query() dto: CreatePrivateRoomDto,
    ) {
        return await this.chatRoomService.findOrCreatePrivateRoom(
            currentUser.user.sub,
            dto.friendId,
        );
    }
}
