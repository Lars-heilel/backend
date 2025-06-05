import { Injectable } from '@nestjs/common';
import { JwtAbstract } from '../jwt.abstract';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class NestjsJwtService extends JwtAbstract {
    constructor(private jwt: JwtService) {
        super();
    }
    async signToken(
        payload: object,
        signOptions: { secret: string; expiresIn: string },
    ): Promise<string> {
        return await this.jwt.signAsync(payload, signOptions);
    }
    async verifyToken(token: string, signOptions: { secret: string }) {
        return await this.jwt.verifyAsync(token, signOptions);
    }
}
