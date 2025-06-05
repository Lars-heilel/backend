import { Module } from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { FriendshipController } from './friendship.controller';
import { PrismaModule } from 'prisma/prisma.module';
import { FriendshipRepositoryAbstract } from './repo/friendship.repository.abstract';
import { FriendshipPrismaRepository } from './repo/friendship.prisma.repository';

@Module({
    imports: [PrismaModule],
    controllers: [FriendshipController],
    providers: [
        FriendshipService,
        {
            provide: FriendshipRepositoryAbstract,
            useClass: FriendshipPrismaRepository,
        },
    ],
    exports: [FriendshipService],
})
export class FriendshipModule {}
