import { Module } from '@nestjs/common';
import { NestjsJwtService } from './nestjs-jwt.service';
import { JwtModule } from '@nestjs/jwt';
import { JWT_SERVICE } from '@src/core/constants/di-token';

@Module({
    providers: [NestjsJwtService, { provide: JWT_SERVICE, useClass: NestjsJwtService }],
    exports: [JWT_SERVICE],
    imports: [JwtModule],
})
export class NestjsJwtModule {}
