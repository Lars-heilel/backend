import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const DeleteSchema = z.object({
    id: z.string().uuid('9044dcc8-7dea-4d21-8c1a-5009ac2c2ece'),
});

export class DeleteUserDTO extends createZodDto(DeleteSchema) {
    @ApiProperty({
        description: 'User id for deletion',
        example: '9044dcc8-7dea-4d21-8c1a-5009ac2c2ece',
    })
    id: string;
}
