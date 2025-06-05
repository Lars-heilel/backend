import { Module } from '@nestjs/common';
import { MailsService } from './mails.service';
import { MailsController } from './mails.controller';
import { NodemailerModule } from 'src/core/security/mails/nodemailer/nodemailer.module';
import { MailTokenManagerModule } from 'src/core/security/mails/mailTokenManager/mail-cache-token-manager.module';
import { TokensModule } from '../auth/tokens/tokens.module';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [NodemailerModule, MailTokenManagerModule, TokensModule, UsersModule],
    controllers: [MailsController],
    providers: [MailsService],
    exports: [MailsService],
})
export class MailsModule {}
