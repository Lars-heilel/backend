import {
    Body,
    Controller,
    Delete,
    Get,
    Logger,
    Param,
    Patch,
    Post,
    Req,
    UseGuards,
    UsePipes,
} from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { ZodValidationPipe } from 'src/common/pipes/zod.validation.pipe';
import { SwaggerDocumentation } from 'src/common/decorators/swagger/swagger.decorator';
import { UpdateFriendshipStatusDto, UpdateFriendshipStatusSchema } from './DTO/update-status.dto';
import { SendFriendRequestDto, SendFriendRequestSchema } from './DTO/send-request.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtUser } from '../auth/tokens/types/jwt-req';

@Controller('friendship')
export class FriendshipController {
    constructor(private readonly friendshipService: FriendshipService) {}
    @Post()
    @SwaggerDocumentation({
        operations: { summary: 'send friendship request' },
        responses: [
            { status: 201, description: 'Request sent' },
            { status: 409, description: 'Conflict' },
        ],
        bearerAuth: true,
    })
    @UseGuards(AuthGuard('jwt'))
    @UsePipes(new ZodValidationPipe(SendFriendRequestSchema))
    async sendRequest(@Req() req: { user: JwtUser }, @Body() dto: SendFriendRequestDto) {
        return await this.friendshipService.sendRequest(req.user.sub, dto.userId);
    }
    @Get()
    @SwaggerDocumentation({
        operations: { summary: 'Get incoming requests' },
        responses: [{ status: 200, description: 'List of requests' }],
        bearerAuth: true,
    })
    @UseGuards(AuthGuard('jwt'))
    async getIncomingRequests(@Req() req: { user: JwtUser }) {
        Logger.log(`${req.user}`);
        return await this.friendshipService.incomingRequest(req.user.sub);
    }
    @Patch(':friendshipId')
    @SwaggerDocumentation({
        operations: { summary: 'Update request status' },
        responses: [
            { status: 200, description: 'Status updated' },
            { status: 403, description: 'Forbidden' },
        ],
        params: [{ name: 'friendshipId', description: 'Request ID' }],
        bearerAuth: true,
    })
    @UseGuards(AuthGuard('jwt'))
    async updateStatus(
        @Param('friendshipId') id: string,
        @Body(new ZodValidationPipe(UpdateFriendshipStatusSchema)) dto: UpdateFriendshipStatusDto,
        @Req() req: { user: JwtUser },
    ) {
        return await this.friendshipService.updateFriendshipStatus(id, req.user.sub, dto.type);
    }

    @Delete(':friendshipId')
    @UseGuards(AuthGuard('jwt'))
    @SwaggerDocumentation({
        operations: { summary: 'Delete friendship' },
        responses: [
            { status: 200, description: 'Friendship deleted' },
            { status: 404, description: 'Not found' },
        ],
        params: [{ name: 'friendshipId', description: 'Friendship ID' }],
        bearerAuth: true,
    })
    async deleteFriend(@Param('friendshipId') friendshipId: string, @Req() req: { user: JwtUser }) {
        await this.friendshipService.deleteFriendship(friendshipId, req.user.sub);
        return { message: 'Friendship deleted' };
    }
}
