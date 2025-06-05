import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const ForgotPasswordDtoSchema = z.object({
    email: z.string().email(),
});

export class ForgotPasswordDto extends createZodDto(ForgotPasswordDtoSchema) {
    @ApiProperty({
        description: 'User email address',
        example: 'user@example.com',
    })
    email: string;
}
