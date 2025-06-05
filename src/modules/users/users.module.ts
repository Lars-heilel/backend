import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from 'prisma/prisma.module';
import { UserPrismaRepository } from './repositories/user.prisma.repository';
import { UserRepositoryAbstract } from './repositories/user.repository.abstract';
import { BcryptModule } from 'src/core/security/encryption/bcrypt/bcrypt.module';

@Module({
    controllers: [UsersController],
    providers: [
        UsersService,
        {
            provide: UserRepositoryAbstract,
            useClass: UserPrismaRepository,
        },
    ],
    imports: [PrismaModule, BcryptModule],
    exports: [UsersService, UserRepositoryAbstract],
})
export class UsersModule {}
