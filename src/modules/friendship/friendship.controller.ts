import {
    Body,
    Controller,
    Delete,
    Get,
    Inject,
    Logger,
    Param,
    Patch,
    Post,
    Req,
    UseGuards,
    UsePipes,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiBody,
    ApiSecurity,
} from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { UpdateFriendshipStatusDto, UpdateFriendshipStatusSchema } from './DTO/update-status.dto';
import { SendFriendRequestDto, SendFriendRequestSchema } from './DTO/send-request.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtUser } from '../auth/tokens/types/jwt-req';
import { FRIENDSHIP_SERVICE, IFriendshipService } from './interface/service.interface';

@ApiTags('Friendship')
@Controller('friendship')
export class FriendshipController {
    constructor(
        @Inject(FRIENDSHIP_SERVICE) private readonly friendshipService: IFriendshipService,
    ) {}

    @Post()
    @UseGuards(AuthGuard('jwt'))
    @UsePipes(new ZodValidationPipe(SendFriendRequestSchema))
    @ApiOperation({ summary: 'Send a friend request' })
    @ApiResponse({ status: 201, description: 'Friend request created' })
    @ApiBody({ type: SendFriendRequestDto })
    @ApiSecurity('access-token')
    async sendRequest(@Req() req: { user: JwtUser }, @Body() dto: SendFriendRequestDto) {
        return await this.friendshipService.sendRequest(req.user.sub, dto.userId);
    }

    @Get()
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Get incoming friend requests' })
    @ApiResponse({ status: 200, description: 'List of incoming friend requests' })
    @ApiSecurity('access-token')
    async getIncomingRequests(@Req() req: { user: JwtUser }) {
        Logger.log(`${JSON.stringify(req.user)}`, 'FriendshipController');
        return await this.friendshipService.incomingRequest(req.user.sub);
    }

    @Patch(':friendshipId')
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Update friendship status (accept/reject)' })
    @ApiParam({ name: 'friendshipId', type: String })
    @ApiBody({ type: UpdateFriendshipStatusDto })
    @ApiResponse({ status: 200, description: 'Friendship status updated' })
    @ApiSecurity('access-token')
    async updateStatus(
        @Param('friendshipId') id: string,
        @Body(new ZodValidationPipe(UpdateFriendshipStatusSchema)) dto: UpdateFriendshipStatusDto,
        @Req() req: { user: JwtUser },
    ) {
        return await this.friendshipService.updateFriendshipStatus(id, req.user.sub, dto.type);
    }

    @Delete(':friendshipId')
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Delete a friendship' })
    @ApiParam({ name: 'friendshipId', type: String })
    @ApiResponse({ status: 200, description: 'Friendship deleted' })
    @ApiSecurity('access-token')
    async deleteFriend(@Param('friendshipId') friendshipId: string, @Req() req: { user: JwtUser }) {
        await this.friendshipService.deleteFriendship(friendshipId, req.user.sub);
        return { message: 'Friendship deleted' };
    }
    @Get('list')
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Get friend list' })
    @ApiResponse({ status: 200, description: 'List of friends' })
    @ApiSecurity('access-token')
    async getFriendList(@Req() req: { user: JwtUser }) {
        return await this.friendshipService.getfirendlist(req.user.sub);
    }
}
