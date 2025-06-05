import { Body, Controller, Get, Post, Put, Query, Res, UsePipes } from '@nestjs/common';
import { MailsService } from './mails.service';
import { Response } from 'express';
import { ResetPasswordDto, ResetPasswordSchema } from './DTO/ResetPassword.dto';
import { ZodValidationPipe } from 'nestjs-zod';
import { ResendConfirmationDto, ResendConfirmationDtoSchema } from './DTO/resend-confirmation.dto';
import { ForgotPasswordDto, ForgotPasswordDtoSchema } from './DTO/forgot-password.dto';
import { SwaggerDocumentation } from 'src/common/decorators/swagger/swagger.decorator';

@Controller('mails')
export class MailsController {
    constructor(private readonly mailsService: MailsService) {}

    @Post('resend-confirmation')
    @SwaggerDocumentation({
        operations: { summary: 'Resend confirmation email' },
        responses: [
            {
                status: 200,
                description: 'Confirmation email has been resent',
            },
            { status: 401, description: 'User not found' },
            { status: 409, description: 'Account already confirmed' },
        ],
    })
    @UsePipes(new ZodValidationPipe(ResendConfirmationDtoSchema))
    async resendConfirmation(@Body() DTO: ResendConfirmationDto) {
        await this.mailsService.resendConfirmationEmail(DTO.email);
        return { message: 'Confirmation email has been resent' };
    }
    @Get('verifyAccount')
    @SwaggerDocumentation({
        operations: { summary: 'Verify user account' },
        responses: [
            {
                status: 200,
                description: 'Account verified and tokens issued',
            },
            { status: 401, description: 'Invalid token' },
            { status: 409, description: 'Account already confirmed' },
        ],
    })
    async verifyAccount(@Query('token') token: string, @Res({ passthrough: true }) res: Response) {
        return await this.mailsService.verifyAccount(token, res);
    }
    @Post('forgot-password')
    @SwaggerDocumentation({
        operations: { summary: 'Request password reset' },
        responses: [
            {
                status: 200,
                description: 'Reset instructions sent if account exists',
            },
            { status: 401, description: 'User not found' },
        ],
    })
    @UsePipes(new ZodValidationPipe(ForgotPasswordDtoSchema))
    async forgotPassword(@Body() DTO: ForgotPasswordDto) {
        await this.mailsService.sendResetPasswordEmail(DTO.email);
        return { message: 'If account exists, reset instructions were sent' };
    }

    @Put('reset-password')
    @SwaggerDocumentation({
        operations: { summary: 'Reset user password' },
        responses: [
            { status: 200, description: 'Password successfully changed' },
            { status: 401, description: 'Invalid token' },
        ],
    })
    @UsePipes(new ZodValidationPipe(ResetPasswordSchema))
    async resetPassword(@Query('token') token: string, @Body() DTO: ResetPasswordDto) {
        await this.mailsService.resetPassword(token, DTO.password);
        return { message: 'Password successfully changed' };
    }
}
