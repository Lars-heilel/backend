import { ConfigService } from '@nestjs/config';
import { Env } from 'src/core/config/envConfig';
import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { EncryptionInterface } from '../interface/encryprion.interface';

@Injectable()
export class BcryptService implements EncryptionInterface {
    constructor(private env: ConfigService<Env>) {}

    async hash(data: string): Promise<string> {
        const saltRounds = this.env.getOrThrow('SALT_ROUNDS', { infer: true });

        return await bcrypt.hash(data, saltRounds);
    }

    async compare(data: string, hashedData: string): Promise<boolean> {
        return await bcrypt.compare(data, hashedData);
    }
}
