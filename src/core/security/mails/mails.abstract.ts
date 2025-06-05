import { SendEmailInterface } from './types/sendEmailInterface';

export abstract class MailsAbstract {
    abstract send(data: SendEmailInterface): Promise<void>;
}
