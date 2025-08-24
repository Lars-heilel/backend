import { Controller, Delete, UsePipes, Get, Query, UseGuards, Req, Inject } from '@nestjs/common';
import { FindUserDTO, FindUserSchema } from './DTO/findUsers.dto';
import { ZodValidationPipe } from 'nestjs-zod';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiCookieAuth } from '@nestjs/swagger';
import { JwtUser } from '../auth/tokens/types/jwt-req';
import { USER_SERVICE } from '@src/core/constants/di-token';
import { UserServiceInterface } from './interface/userServiceInterface';

@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(@Inject(USER_SERVICE) private readonly usersService: UserServiceInterface) {}
    @Delete()
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Delete user by email' })
    @ApiResponse({ status: 200, description: 'User deleted successfully' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiBearerAuth('access-token')
    @ApiCookieAuth('refresh-token')
    async deleteUser(@Req() req: { user: JwtUser }) {
        return await this.usersService.deleteUser(req.user.sub);
    }

    @Get()
    @UseGuards(AuthGuard('jwt'))
    @UsePipes(new ZodValidationPipe(FindUserSchema))
    @ApiOperation({ summary: 'Find users by query' })
    @ApiResponse({ status: 200, description: 'Users found successfully' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiBearerAuth('access-token')
    @ApiCookieAuth('refresh-token')
    async publicFindUsers(@Query() data: FindUserDTO) {
        return await this.usersService.publicFindUsers(data);
    }
    @Get('/profile')
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Get my profile' })
    @ApiResponse({ status: 200, description: 'My profile' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiBearerAuth('access-token')
    @ApiCookieAuth('refresh-token')
    async getProfile(@Req() req: { user: JwtUser }) {
        return await this.usersService.getProfile(req.user.sub);
    }
}
