import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const ResendConfirmationDtoSchema = z.object({
    email: z.string().email(),
});

export class ResendConfirmationDto extends createZodDto(ResendConfirmationDtoSchema) {
    @ApiProperty({
        description: 'User email address',
        example: 'user@example.com',
        format: 'email',
    })
    email: string;
}
