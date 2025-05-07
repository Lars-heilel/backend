import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Env } from 'src/core/config/envConfig';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptService {
    constructor(private env: ConfigService<Env>) {}
    async hash(data: string) {
        const saltRounds = this.env.get('SALT_ROUNDS');
        return bcrypt.hash(data, saltRounds);
    }
    async compare(data: string, hashedData: string) {
        return bcrypt.compare(data, hashedData);
    }
}
