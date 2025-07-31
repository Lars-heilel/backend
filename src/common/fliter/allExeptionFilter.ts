import { ArgumentsHost, Catch, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
@Catch()
export class AllExceptionsFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);
    constructor(private readonly httpAdapter: HttpAdapterHost) {}
    catch(exception: unknown, host: ArgumentsHost): void {
        const { httpAdapter } = this.httpAdapter;

        const ctx = host.switchToHttp();
        if (ctx.getRequest<Request>() && ctx.getResponse<Response>()) {
            const httpStatus =
                exception instanceof HttpException
                    ? exception.getStatus()
                    : HttpStatus.INTERNAL_SERVER_ERROR;
            const responseBody = {
                statusCode: httpStatus,
                timestamp: new Date().toISOString(),
                path: ctx.getRequest<Request>().url,
                message:
                    exception instanceof HttpException
                        ? exception.message
                        : 'Internal server error',
            };
            this.logger.error(
                `HTTP Status: ${httpStatus} Error Message: ${responseBody.message}`,
                exception,
            );
            httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
        } else {
            if (exception instanceof WsException) {
                this.logger.error(`WebSocket Error: ${exception.message}`, exception.stack);
                host.switchToWs().getClient<Socket>().emit('exception', {
                    status: 'error',
                    message: exception.message,
                });
            }
        }
    }
}
