import { ConfigService } from '@nestjs/config';
import { Env } from 'src/core/config/envConfig';
import * as bcrypt from 'bcrypt';
import { EncryptionAbstract } from '../encryption.abstract';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BcryptService extends EncryptionAbstract {
    constructor(private env: ConfigService<Env>) {
        super();
    }

    async hash(data: string): Promise<string> {
        const saltRounds = this.env.getOrThrow('SALT_ROUNDS', { infer: true });

        return await bcrypt.hash(data, saltRounds);
    }

    async compare(data: string, hashedData: string): Promise<boolean> {
        return await bcrypt.compare(data, hashedData);
    }
}
