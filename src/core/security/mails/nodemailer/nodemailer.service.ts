import { Injectable } from '@nestjs/common';
import { MailsAbstract } from '../mails.abstract';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { Env } from 'src/core/config/envConfig';
import { SendEmailInterface } from '../types/sendEmailInterface';

@Injectable()
export class NodemailerService extends MailsAbstract {
    private transporter: nodemailer.Transporter;

    constructor(private env: ConfigService<Env>) {
        super();
        this.transporter = nodemailer.createTransport({
            host: this.env.get('NODEMAILER_HOST'),
            port: 465,
            secure: true,
            auth: {
                user: this.env.get('NODEMAILER_EMAIL'),
                pass: this.env.get('NODEMAILER_PASSWORD'),
            },
        });
    }
    async send(data: SendEmailInterface): Promise<void> {
        await this.transporter.sendMail({
            from: `${this.env.get('APP_NAME')}<${this.env.get('NODEMAILER_EMAIL')}>`,
            to: data.to,
            subject: data.subject,
            html: data.html,
        });
    }
}
