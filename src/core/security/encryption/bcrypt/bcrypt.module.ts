import { Module } from '@nestjs/common';
import { BcryptService } from './bcrypt.service';
import { ENCRYPTION_SERVICE } from '@src/core/constants/di-token';

@Module({
    exports: [ENCRYPTION_SERVICE],
    providers: [{ provide: ENCRYPTION_SERVICE, useClass: BcryptService }],
})
export class BcryptModule {}
