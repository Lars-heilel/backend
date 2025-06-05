import { Module } from '@nestjs/common';
import { BcryptService } from './bcrypt.service';
import { EncryptionAbstract } from '../encryption.abstract';

@Module({
    exports: [EncryptionAbstract],
    providers: [{ provide: EncryptionAbstract, useClass: BcryptService }],
})
export class BcryptModule {}
