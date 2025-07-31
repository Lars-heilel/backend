import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const HistoriSchema = z.object({
    userId: z.string().min(1, 'User ID is required'),
    secondUserId: z.string().min(1, 'Second user ID is required'),
    limit: z.coerce.number().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100'),
    cursor: z
        .object({
            id: z.string().optional(),
            createAt: z.date().optional(),
        })
        .optional(),
});
export class HistoryDto extends createZodDto(HistoriSchema) {
    @ApiProperty({
        description: 'ID of the user requesting the chat history',
        example: 'user123',
    })
    userId: string;

    @ApiProperty({
        description: 'ID of the second user in the chat',
        example: 'user456',
    })
    secondUserId: string;

    @ApiProperty({
        description: 'Number of messages to retrieve',
        example: 20,
        minimum: 1,
        maximum: 100,
    })
    limit: number;

    @ApiProperty({
        description: 'Cursor for pagination, used to fetch messages after a specific point',
        type: Object,
        required: false,
    })
    cursor?: { id?: string; createAt?: Date };
}
