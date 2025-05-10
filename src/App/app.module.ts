import { createKeyv } from '@keyv/redis';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from 'prisma/prisma.module';
import { validate } from 'src/core/config/envConfig';
import { AuthModule } from 'src/modules/auth/auth.module';
import { BcryptModule } from 'src/modules/security/bcrypt/bcrypt.module';
import { RefreshTokenModule } from 'src/modules/security/refresh-token/refresh-token.module';
import { UsersModule } from 'src/modules/users/users.module';

@Module({
    imports: [
        CacheModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async () => ({
                stores: [createKeyv('redis://localhost:6379')],
            }),
            isGlobal: true,
            inject: [ConfigService],
        }),
        ConfigModule.forRoot({ isGlobal: true, validate }),
        PrismaModule,
        BcryptModule,
        UsersModule,
        AuthModule,
        RefreshTokenModule,
    ],
})
export class AppModule {}
