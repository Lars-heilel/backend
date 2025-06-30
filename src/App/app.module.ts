import { createKeyv } from '@keyv/redis';
import { RedisModule } from '@nestjs-modules/ioredis';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from 'prisma/prisma.module';
import { validate } from 'src/core/config/envConfig';
import { AuthModule } from 'src/modules/auth/auth.module';
import { ChatModule } from 'src/modules/chat/chat.module';
import { FriendshipModule } from 'src/modules/friendship/friendship.module';
import { UsersModule } from 'src/modules/users/users.module';

@Module({
    imports: [
        RedisModule.forRootAsync({
            useFactory: () => ({
                type: 'single',
                url: 'redis://localhost:6379',
            }),
        }),
        CacheModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async () => ({
                stores: [createKeyv('redis://localhost:6379')],
                ttl: 24 * 60 * 60 * 1000,
            }),

            isGlobal: true,
            inject: [ConfigService],
        }),
        ConfigModule.forRoot({ isGlobal: true, validate }),
        PrismaModule,
        UsersModule,
        AuthModule,
        FriendshipModule,
        ChatModule,
    ],
})
export class AppModule {}
