import { Module } from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { FriendshipController } from './friendship.controller';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
    controllers: [FriendshipController],
    providers: [FriendshipService],
    imports: [PrismaModule],
})
export class FriendshipModule {}
