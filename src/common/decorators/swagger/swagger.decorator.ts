import { applyDecorators } from '@nestjs/common';
import {
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
    ApiQuery,
    ApiBody,
} from '@nestjs/swagger';
import { documentOptions } from './types/documentOptions.type';

export function SwaggerDocumentation(options: documentOptions) {
    const decorators = [
        ApiOperation({
            summary: options.operations.summary,
            description: options.operations.description,
            deprecated: options.operations.deprecated,
        }),
    ];

    options.responses.forEach((res) => {
        decorators.push(
            ApiResponse({
                content: res.content,
                isArray: res.isArray,
                type: res.type,
                status: res.status,
                description: res.description,
            }),
        );
    });
    options.params?.forEach((params) => {
        decorators.push(
            ApiParam({
                name: params.name,
                description: params.description,
                required: params.required,
                type: params.type,
                enum: params.enum,
            }),
        );
    });
    options.query?.forEach((query) => {
        decorators.push(
            ApiQuery({
                name: query.name,
                description: query.description,
                required: query.required,
                type: query.type,
            }),
        );
    });
    options.body?.forEach((body) => {
        decorators.push(ApiBody({ type: body.type }));
    });
    if (options.bearerAuth) {
        decorators.push(ApiBearerAuth('access-token'));
    }

    return applyDecorators(...decorators);
}
