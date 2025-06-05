import { Module } from '@nestjs/common';
import { NodemailerService } from './nodemailer.service';
import { MailsAbstract } from '../mails.abstract';

@Module({
    providers: [NodemailerService, { provide: MailsAbstract, useClass: NodemailerService }],
    exports: [MailsAbstract],
})
export class NodemailerModule {}
