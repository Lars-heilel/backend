import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'prisma/prisma.module';
import { validate } from 'src/core/config/envConfig';
import { AuthModule } from 'src/modules/auth/auth.module';
import { BcryptModule } from 'src/modules/security/bcrypt/bcrypt.module';
import { RefreshTokenModule } from 'src/modules/security/refresh-token/refresh-token.module';
import { UsersModule } from 'src/modules/users/users.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, validate }),
        PrismaModule,
        BcryptModule,
        UsersModule,
        AuthModule,
        RefreshTokenModule,
    ],
})
export class AppModule {}
