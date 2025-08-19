import { Body, Controller, Get, Post, Put, Query, Res, UsePipes } from '@nestjs/common';
import { MailsService } from './mails.service';
import { Response } from 'express';
import { ResetPasswordDto, ResetPasswordSchema } from './DTO/ResetPassword.dto';
import { ZodValidationPipe } from 'nestjs-zod';
import { ResendConfirmationDto, ResendConfirmationDtoSchema } from './DTO/resend-confirmation.dto';
import { ForgotPasswordDto, ForgotPasswordDtoSchema } from './DTO/forgot-password.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBody } from '@nestjs/swagger';

@ApiTags('Mails')
@Controller('mails')
export class MailsController {
    constructor(private readonly mailsService: MailsService) {}

    @Post('resend-confirmation')
    @UsePipes(new ZodValidationPipe(ResendConfirmationDtoSchema))
    @ApiOperation({ summary: 'Resend confirmation email' })
    @ApiResponse({ status: 200, description: 'Confirmation email has been resent' })
    @ApiBody({ type: ResendConfirmationDto })
    async resendConfirmation(@Body() DTO: ResendConfirmationDto): Promise<{ message: string }> {
        await this.mailsService.resendConfirmationEmail(DTO.email);
        return { message: 'Confirmation email has been resent' };
    }

    @Get('verify-account')
    @ApiOperation({ summary: 'Verify account by token' })
    @ApiQuery({ name: 'token', type: String, required: true })
    @ApiResponse({ status: 200, description: 'Account successfully verified' })
    async verifyAccount(@Query('token') token: string, @Res({ passthrough: true }) res: Response) {
        return await this.mailsService.verifyAccount(token, res);
    }

    @Post('forgot-password')
    @UsePipes(new ZodValidationPipe(ForgotPasswordDtoSchema))
    @ApiOperation({ summary: 'Send password reset email' })
    @ApiResponse({ status: 200, description: 'To change your password, check your email' })
    @ApiBody({ type: ForgotPasswordDto })
    async forgotPassword(@Body() DTO: ForgotPasswordDto): Promise<{ message: string }> {
        await this.mailsService.sendResetPasswordEmail(DTO.email);
        return { message: 'To change your password, check your email' };
    }

    @Put('reset-password')
    @ApiOperation({ summary: 'Reset password by token' })
    @ApiQuery({ name: 'token', type: String, required: true })
    @ApiResponse({ status: 200, description: 'Password successfully changed' })
    @ApiBody({ type: ResetPasswordDto })
    async resetPassword(
        @Query('token') token: string,
        @Body(new ZodValidationPipe(ResetPasswordSchema)) DTO: ResetPasswordDto,
    ): Promise<{ message: string }> {
        await this.mailsService.resetPassword(token, DTO.password);
        return { message: 'Password successfully changed' };
    }
}
