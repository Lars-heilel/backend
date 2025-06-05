import { Module } from '@nestjs/common';
import { NestjsJwtService } from './nestjs-jwt.service';
import { JwtAbstract } from '../jwt.abstract';
import { JwtModule } from '@nestjs/jwt';

@Module({
    providers: [NestjsJwtService, { provide: JwtAbstract, useClass: NestjsJwtService }],
    exports: [JwtAbstract],
    imports: [JwtModule],
})
export class NestjsJwtModule {}
