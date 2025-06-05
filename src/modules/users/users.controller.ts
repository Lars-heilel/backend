import { Controller, Delete, Body, UsePipes, Get, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { FindUserDTO, FindUserSchema } from './DTO/findUsers.dto';
import { ZodValidationPipe } from 'src/common/pipes/zod.validation.pipe';
import { SwaggerDocumentation } from 'src/common/decorators/swagger/swagger.decorator';
import { DeleteSchema, DeleteUserDTO } from './DTO/deleteUser.dto';
import { PublicUserDto } from './DTO/publicProfile.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}
    @Delete()
    @SwaggerDocumentation({
        operations: {
            summary: 'Delete user by email',
            description: 'Permanently deletes a user account using email address',
        },
        responses: [
            { status: 200, description: 'User deleted successfully' },
            { status: 400, description: 'Invalid input data' },
            { status: 404, description: 'User not found' },
            { status: 500, description: 'Internal server error' },
        ],
        bearerAuth: true,
    })
    @UseGuards(AuthGuard('jwt'))
    @UsePipes(new ZodValidationPipe(DeleteSchema))
    async deleteUser(@Body() DTO: DeleteUserDTO) {
        return await this.usersService.deleteUser(DTO.email);
    }
    @Get()
    @UseGuards(AuthGuard('jwt'))
    @UsePipes(new ZodValidationPipe(FindUserSchema))
    @SwaggerDocumentation({
        operations: {
            summary: 'Find users by criteria',
            description:
                'Search users by email, name or ID. At least one parameter must be provide',
        },
        responses: [
            {
                status: 200,
                description: 'Array of matching users (may be empty)',
                type: [PublicUserDto],
            },
            { status: 400, description: 'Invalid search parameters' },
            { status: 500, description: 'Internal server error' },
        ],
        bearerAuth: true,
    })
    async publicFindUsers(@Query() data: FindUserDTO) {
        return await this.usersService.publicFindUsers(data);
    }
}
