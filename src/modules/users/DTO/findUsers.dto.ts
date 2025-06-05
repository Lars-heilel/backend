import { ApiPropertyOptional } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
export const FindUserSchema = z
    .object({
        email: z.string().email().optional(),
        name: z.string().optional(),
        id: z.string().optional(),
    })
    .refine((data) => data.email || data.name || data.id, {
        message: 'You must provide email, name or user ID',
    });
export class FindUserDTO extends createZodDto(FindUserSchema) {
    @ApiPropertyOptional({
        description: 'User email for search',
        example: 'user@example.com',
        required: false,
    })
    email?: string;

    @ApiPropertyOptional({
        description: 'User name for search',
        example: 'John Doe',
        required: false,
    })
    name?: string;

    @ApiPropertyOptional({
        description: 'User ID for search',
        example: '550e8400-e29b-41d4-a716-446655440000',
        required: false,
    })
    id?: string;
}
