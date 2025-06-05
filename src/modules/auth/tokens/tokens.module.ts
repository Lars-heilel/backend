import { Module } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { PrismaModule } from 'prisma/prisma.module';
import { RefreshTokensRepositoryAbsctract } from './repositories/refreshToken/refreshTokens.repository.abstract';
import { RefresTokenPrismaRepository } from './repositories/refreshToken/refreshToken.prisma.repository';
import { BcryptModule } from 'src/core/security/encryption/bcrypt/bcrypt.module';
import { NestjsJwtModule } from 'src/core/security/jwt/nestjs-jwt/nestjs-jwt.module';
import { UsersModule } from 'src/modules/users/users.module';

@Module({
    providers: [
        TokensService,
        { provide: RefreshTokensRepositoryAbsctract, useClass: RefresTokenPrismaRepository },
    ],
    imports: [PrismaModule, NestjsJwtModule, BcryptModule, UsersModule],
    exports: [TokensService],
})
export class TokensModule {}
