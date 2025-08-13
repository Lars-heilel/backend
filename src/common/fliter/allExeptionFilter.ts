import { ArgumentsHost, Catch, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Request, Response } from 'express';
import { ZodValidationException } from 'nestjs-zod';
import { ZodIssue } from 'zod';

interface IResBody {
    message: string;
    path: string;
    timestamp: Date;
    zodErrors?: string[];
    statusCode: number;
}

@Catch()
export class AllExceptionsFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    constructor(private readonly httpAdapter: HttpAdapterHost) {}

    catch(exception: unknown, host: ArgumentsHost): void {
        const { httpAdapter } = this.httpAdapter;
        const ctx = host.switchToHttp();
        if (host.getType() === 'ws') {
            const client = host.switchToWs().getClient<Socket>();
            let wsMessage: string;

            if (exception instanceof WsException) {
                this.logger.error('WebSocket error:', exception.message);
                wsMessage = exception.message;
            } else {
                this.logger.error('Unhandled WebSocket exception:', exception);
                wsMessage = 'Internal server error';
            }

            client.emit('exception', {
                status: 'error',
                message: wsMessage,
            });
            return;
        }

        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let message: string;
        let statusCode: number;
        let zodErrors: string[] = [];

        if (exception instanceof ZodValidationException) {
            statusCode = exception.getStatus();
            message = 'Validation failed';

            if (process.env.NODE_ENV !== 'production') {
                zodErrors = exception.getZodError().errors.map((e: ZodIssue) => e.message);
            }
            this.logger.warn('Validation exception:', zodErrors);
        } else if (exception instanceof HttpException) {
            statusCode = exception.getStatus();
            message = exception.message;
            this.logger.error(`HTTP exception (status: ${statusCode}):`, message);
        } else {
            this.logger.error('Unhandled exception:', exception);
            statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
            message = 'Internal server error';
        }

        const responseBody: IResBody = {
            message,
            statusCode,
            timestamp: new Date(),
            path: request.url,
        };

        if (zodErrors.length > 0) {
            responseBody.zodErrors = zodErrors;
        }

        httpAdapter.reply(response, responseBody, statusCode);
    }
}