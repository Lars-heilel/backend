import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from 'prisma/prisma.module';
import { BcryptModule } from '../security/bcrypt/bcrypt.module';

@Module({
    controllers: [UsersController],
    providers: [UsersService],
    imports: [PrismaModule, BcryptModule],
    exports: [UsersService],
})
export class UsersModule {}
