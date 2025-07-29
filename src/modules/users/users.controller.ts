import { Controller, Delete, Body, UsePipes, Get, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { FindUserDTO, FindUserSchema } from './DTO/findUsers.dto';
import { ZodValidationPipe } from 'src/common/pipes/zod.validation.pipe';
import { DeleteSchema, DeleteUserDTO } from './DTO/deleteUser.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiCookieAuth } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}
    @Delete()
    @UseGuards(AuthGuard('jwt'))
    @UsePipes(new ZodValidationPipe(DeleteSchema))
    @ApiOperation({ summary: 'Delete user by email' })
    @ApiResponse({ status: 200, description: 'User deleted successfully' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiBearerAuth('access-token')
    @ApiCookieAuth('refresh-token')
    async deleteUser(@Body() DTO: DeleteUserDTO) {
        return await this.usersService.deleteUser(DTO.email);
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
}
