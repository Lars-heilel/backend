import { Module } from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { FriendshipController } from './friendship.controller';
import { PrismaModule } from '@prisma/prisma.module';
import { FRIENDSHIP_SERVICE } from './interface/service.interface';
import { FRIENDSHIP_REPOSITORY } from './interface/repo.interface';
import { FriendshipPrismaRepository } from './repo/friendship.prisma.repository';
@Module({
    imports: [PrismaModule],
    controllers: [FriendshipController],
    providers: [
        {
            provide: FRIENDSHIP_SERVICE,
            useClass: FriendshipService,
        },
        {
            provide: FRIENDSHIP_REPOSITORY,
            useClass: FriendshipPrismaRepository,
        },
    ],
    exports: [FRIENDSHIP_SERVICE],
})
export class FriendshipModule {}
