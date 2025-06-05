import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const DeleteSchema = z.object({
    email: z.string().email('user@example.com'),
});

export class DeleteUserDTO extends createZodDto(DeleteSchema) {
    @ApiProperty({
        description: 'User email for deletion',
        example: 'user@example.com',
    })
    email: string;
}
