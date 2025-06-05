import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';

import { MailTokenManagerAbstract } from './mail-token-manager.abstract';
import { CacheTokenManager } from './mail-cache-token-manager.service';

@Module({
    imports: [CacheModule.register()],
    providers: [
        {
            provide: MailTokenManagerAbstract,
            useClass: CacheTokenManager,
        },
    ],
    exports: [MailTokenManagerAbstract],
})
export class MailTokenManagerModule {}
