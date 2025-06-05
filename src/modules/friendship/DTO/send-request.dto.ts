import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const SendFriendRequestSchema = z.object({
    userId: z.string().uuid(),
});

export class SendFriendRequestDto extends createZodDto(SendFriendRequestSchema) {
    @ApiProperty({
        description: 'User Id',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    userId: string;
}
