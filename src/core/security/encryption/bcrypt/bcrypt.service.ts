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
        const saltRounds = this.env.get('SALT_ROUNDS');
        try {
            return await bcrypt.hash(data, saltRounds);
        } catch (error) {
            throw new Error('Password hashing failed');
        }
    }

    async compare(data: string, hashedData: string): Promise<boolean> {
        try {
            return await bcrypt.compare(data, hashedData);
        } catch (error) {
            throw new Error('Password comparison failed');
        }
    }
}
