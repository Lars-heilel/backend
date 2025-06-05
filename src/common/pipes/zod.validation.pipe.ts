import { BadRequestException, Logger, PipeTransform } from '@nestjs/common';
import { ZodSchema } from 'zod';
export class ZodValidationPipe<T> implements PipeTransform {
    private readonly logger = new Logger(ZodValidationPipe.name);
    constructor(private schema: ZodSchema<T>) {}
    transform(value: unknown): T {
        //    this.logger.debug(`input value:${JSON.stringify(value)}`);
        const result = this.schema.safeParse(value);

        if (!result.success) {
            this.logger.error(`validation errors:${JSON.stringify(result.error.errors)}`);
            throw new BadRequestException({
                message: 'Validation failed',
                errors: result.error.errors,
            });
        }

        return result.data;
    }
}
