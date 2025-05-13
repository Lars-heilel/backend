import {
    Body,
    Controller,
    Delete,
    Get,
    Logger,
    Param,
    Patch,
    Post,
    Put,
    Req,
    UseGuards,
} from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { UserRequest } from '../auth/types/userRequest';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('friendship')
export class FriendshipController {
    private readonly logger = new Logger(FriendshipController.name);
    constructor(private readonly friendshipService: FriendshipService) {}
    @Post('send-request/:userId')
    @UseGuards(JwtAuthGuard)
    async sendFriendRequest(
        @Param('userId') addressesID: string,
        @Req() req: { user: UserRequest },
    ) {
        this.logger.debug(`Проверка входных  данных ${req.user.id},${addressesID}`);
        return await this.friendshipService.sendRequest(req.user.id, addressesID);
    }
    @Get('incoming')
    @UseGuards(JwtAuthGuard)
    async incomingRequest(@Req() req: { user: UserRequest }) {
        return await this.friendshipService.incomingRequest(req.user.id);
    }
    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    async updateFriendStatus(
        @Param('id') frendshipSchemaId: string,
        @Body() body: { type: 'ACCEPTED' | 'REJECTED' },
        @Req() req: { user: UserRequest },
    ) {
        return await this.friendshipService.updateFriendshipStatus(
            frendshipSchemaId,
            req.user.id,
            body.type,
        );
    }
    @Delete('deleteFriends/:id')
    @UseGuards(JwtAuthGuard)
    async deleteFriends(@Param('id') addresseeId: string, @Req() req: { user: UserRequest }) {
        return await this.friendshipService.deleteFriend(req.user.id, addresseeId);
    }
}
