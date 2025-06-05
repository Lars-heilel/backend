import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { TokensModule } from './tokens/tokens.module';
import { MailsModule } from '../mails/mails.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Env } from 'src/core/config/envConfig';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
    controllers: [AuthController],
    providers: [AuthService, LocalStrategy, JwtStrategy],
    imports: [
        UsersModule,
        PassportModule,
        TokensModule,
        MailsModule,
        PassportModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService<Env>) => ({
                secret: configService.get('JWT_SECRET'),
                signOptions: { expiresIn: configService.get('JWT_EXPIRES') },
            }),
            inject: [ConfigService],
        }),
    ],
})
export class AuthModule {}
