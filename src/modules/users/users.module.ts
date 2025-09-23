import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '@prisma/prisma.module';
import { UserPrismaRepository } from './repositories/user.prisma.repository';
import { BcryptModule } from 'src/core/security/encryption/bcrypt/bcrypt.module';
import { USER_REPOSITORY, USER_SERVICE } from '@src/core/config/di-token';

@Module({
    controllers: [UsersController],
    providers: [
        { provide: USER_SERVICE, useClass: UsersService },
        {
            provide: USER_REPOSITORY,
            useClass: UserPrismaRepository,
        },
    ],
    imports: [PrismaModule, BcryptModule],
    exports: [USER_SERVICE],
})
export class UsersModule {}
