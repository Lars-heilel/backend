import { Module } from '@nestjs/common';
import { RefreshTokenService } from './refresh-token.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Env } from 'src/core/config/envConfig';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
    exports: [RefreshTokenService],
    providers: [RefreshTokenService],
    imports: [
        PrismaModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService<Env>) => ({
                secret: configService.get('JWT_SECRET_REFRESH'),
                signOptions: {
                    expiresIn: configService.get('JWT_REFRESH_EXPIRES'),
                },
            }),
            inject: [ConfigService],
        }),
    ],
})
export class RefreshTokenModule {}
