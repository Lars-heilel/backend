import { Controller, Delete, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from 'prisma/generated';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}
    @Delete('deleteUser')
    async deleteUser(@Body() user: User) {
        return await this.usersService.deleteUser(user.email);
    }
}
