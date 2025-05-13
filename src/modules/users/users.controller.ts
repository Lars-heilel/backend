import { Controller, Delete, Body, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from 'prisma/generated';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { FindUserDTO } from './DTO/findUsers.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}
    @Delete('deleteUser')
    async deleteUser(@Body() user: User) {
        return await this.usersService.deleteUser(user.email);
    }
    @Post('findUser')
    @UseGuards(JwtAuthGuard)
    async findAllUser(@Body() user: FindUserDTO) {
        return this.usersService.findUsers(user);
    }
}
