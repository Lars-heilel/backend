import { createKeyv } from '@keyv/redis';
import { RedisModule } from '@nestjs-modules/ioredis';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '@prisma/prisma.module';
import { Env, validate } from 'src/core/config/envConfig';
import { AuthModule } from 'src/modules/auth/auth.module';
import { FriendshipModule } from 'src/modules/friendship/friendship.module';
import { UsersModule } from 'src/modules/users/users.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppGatewayModule } from '@src/modules/app_gateway/app-gateway.module';
import { MessageModule } from '@src/modules/message/message.module';
import { ChatRoomModule } from '@src/modules/chat-room/chat-room.module';
@Module({
    imports: [
        EventEmitterModule.forRoot(),
        RedisModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (env: ConfigService<Env>) => ({
                type: 'single',
                url: `${env.get('REDIS_URL')}`,
            }),
            inject: [ConfigService],
        }),
        CacheModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (env: ConfigService<Env>) => ({
                stores: [createKeyv(`${env.get('REDIS_URL')}`)],
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
        AppGatewayModule,
        MessageModule,
        ChatRoomModule,
    ],
})
export class AppModule {}
