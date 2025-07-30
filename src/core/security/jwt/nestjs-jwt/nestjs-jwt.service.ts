import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '@src/modules/auth/tokens/types/jwt-payload';
import { JwtServiceInterface } from '../interface/jwt.interface';

@Injectable()
export class NestjsJwtService implements JwtServiceInterface {
    constructor(private jwt: JwtService) {}
    async signToken(
        payload: object,
        signOptions: { secret: string; expiresIn: string },
    ): Promise<string> {
        return await this.jwt.signAsync(payload, signOptions);
    }
    async verifyToken(token: string, signOptions: { secret: string }) {
        return await this.jwt.verifyAsync<JwtPayload>(token, signOptions);
    }
}
