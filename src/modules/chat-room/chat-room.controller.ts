import { Controller, Get, Inject, Query, Req, UseGuards, UsePipes } from '@nestjs/common';
import {
    CHAT_ROOM_SERVICE_INTERFACE,
    ChatRoomServiceInterface,
} from './interface/chatRoomServiceIntreface';
import { AuthGuard } from '@nestjs/passport';
import { JwtUser } from '../auth/tokens/types/jwt-req';
import { ZodValidationPipe } from 'nestjs-zod';
import { CreatePrivateRoomDto, CreatePrivateRoomSchema } from './DTO';

@Controller('ChatRoom')
export class ChatRoomController {
    constructor(
        @Inject(CHAT_ROOM_SERVICE_INTERFACE)
        private readonly chatRoomService: ChatRoomServiceInterface,
    ) {}
    @Get('private')
    @UseGuards(AuthGuard('jwt'))
    @UsePipes(new ZodValidationPipe(CreatePrivateRoomSchema))
    async findOrCreatePrivateChatRoom(
        @Req() currentUser: JwtUser,
        @Query() dto: CreatePrivateRoomDto,
    ) {
        return await this.chatRoomService.findOrCreatePrivateRoom(currentUser.sub, dto.friendId);
    }
}
