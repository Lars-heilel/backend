import {
    ConflictException,
    Inject,
    Injectable,
    Logger,
    UnauthorizedException,
} from '@nestjs/common';
import { MailsAbstract } from 'src/core/security/mails/mails.abstract';
import { MailTokenManagerAbstract } from 'src/core/security/mails/mailTokenManager/mail-token-manager.abstract';
import { $endpoints, $getFrontUrl } from 'src/common/const/$frontendUrl';
import { EmailTemplate } from 'src/core/security/mails/nodemailer/UI/EmailTemplate';
import { SafeUser } from '../users/Types/user.types';

import { TokensService } from '../auth/tokens/tokens.service';
import { Response } from 'express';
import { JwtPayload } from '../auth/tokens/types/jwt-payload';
import { USER_SERVICE } from '@src/core/constants/di-token';
import { UserServiceInterface } from '../users/interface/userServiceInterface';

@Injectable()
export class MailsService {
    private readonly logger = new Logger(MailsService.name);
    constructor(
        private mailAbstract: MailsAbstract,
        private mailTokenManager: MailTokenManagerAbstract,
        @Inject(USER_SERVICE) private usersService: UserServiceInterface,
        private tokensService: TokensService,
    ) {}

    async sendConfirmationEmail(user: SafeUser) {
        this.logger.debug(`Starting confirmation email sending for user: ${user.email}`);
        const token = await this.mailTokenManager.generateAndCacheTokens(user, 'confirm');
        const url = `${$getFrontUrl($endpoints.email.confirmEmail)}?token=${token}`;
        const email = user.email;
        const template = EmailTemplate.confirmEmail(url);
        await this.mailAbstract.send({ to: email, subject: 'Confirm mail', html: template });
        this.logger.log(`Confirmation email sent successfully to ${user.email}`);
    }
    async sendResetPasswordEmail(email: string) {
        this.logger.debug(`Initiating password reset process for: ${email}`);
        const user = await this.usersService.findUserByEmail(email);
        if (!user) {
            this.logger.warn(`Password reset attempt for non-existent user: ${email}`);
            throw new UnauthorizedException('User not found');
        }
        const token = await this.mailTokenManager.generateAndCacheTokens(user, 'reset');
        const url = `${$getFrontUrl($endpoints.email.resetPassword)}?token=${token}`;
        const userEmail = user.email;
        const template = EmailTemplate.resetPasswordEmail(url);

        await this.mailAbstract.send({
            to: userEmail,
            subject: 'Reset password mail',
            html: template,
        });
        this.logger.log(`Reset password email sent successfully to ${email}`);
    }

    async resendConfirmationEmail(email: string): Promise<void> {
        this.logger.debug(`Resending confirmation email to: ${email}`);
        const user = await this.usersService.findUserByEmail(email);
        if (!user) {
            this.logger.warn(`Resend confirmation attempt for non-existent user: ${email}`);
            throw new UnauthorizedException('User not found');
        }
        if (user.isConfirmed) {
            this.logger.warn(`Resend confirmation for already confirmed account: ${email}`);
            throw new ConflictException('Account already confirmed');
        }
        await this.sendConfirmationEmail(user);
        this.logger.log(`Confirmation email resent successfully to ${email}`);
    }
    async verifyAccount(token: string, res: Response) {
        this.logger.debug(`Account verification with token: ${token.substring(0, 5)}...`);
        const user = await this.mailTokenManager.validateToken('confirm', token);
        if (!user) {
            this.logger.warn(`Account verification failed - invalid token`);
            throw new UnauthorizedException('Invalid token');
        }

        const isConfirmed = await this.usersService.isConfirmed(user.id);
        if (isConfirmed) {
            this.logger.warn(`Account already confirmed: ${user.email}`);
            throw new ConflictException('Account already confirmed');
        }
        this.logger.verbose(`Confirming account for user: ${user.email}`);
        await this.usersService.accountConfirmation(user.email);
        this.logger.verbose(`Account confirmed in database: ${user.email}`);
        const payload: JwtPayload = { sub: user.id, email: user.email };
        const { access_token, refresh_token } = await this.tokensService.createTokens(payload);
        this.tokensService.setRefreshTokenCookie(res, refresh_token);

        this.logger.log(`Account successfully verified: ${user.email}`);
        return { token: access_token };
    }

    async resetPassword(token: string, newPassword: string) {
        this.logger.debug(`Initiating password reset with token`);
        const user = await this.mailTokenManager.validateToken('reset', token);
        if (!user) {
            this.logger.warn(`Password reset failed - invalid token: ${token.substring(0, 5)}...`);
            throw new UnauthorizedException('Invalid token');
        }

        await this.usersService.updatePassword(user.email, newPassword);
        await this.mailTokenManager.revokeToken('reset', token);

        this.logger.log(`Password successfully reset for: ${user.email}`);
        return { message: 'Password changed successfully' };
    }
}
