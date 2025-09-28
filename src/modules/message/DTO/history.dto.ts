import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const HistorySchema = z.object({
    chatRoomId: z.string().min(1, 'Chat Room ID is required'),
    limit: z.coerce
        .number()
        .min(1, 'Limit must be at least 1')
        .max(100, 'Limit cannot exceed 100')
        .default(20),
    lastMessageId: z.string().uuid().optional(),
    lastMessageCreatedAt: z.string().datetime().optional(),
});

export class HistoryDto extends createZodDto(HistorySchema) {
    @ApiProperty({
        description: 'ID roomId',
        example: 'a09a037c-8bb3-4ab6-b026-f4f16edd276e',
    })
    chatRoomId: string;

    @ApiProperty({
        description: 'limit messages for pagination',
        example: 20,
        minimum: 1,
        maximum: 100,
        default: 20,
    })
    limit: number;

    @ApiPropertyOptional({
        description: 'lastMessageId for cursor',
        example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    })
    lastMessageId?: string;

    @ApiPropertyOptional({
        description: 'last message createdAt for cursor',
        example: '2025-09-25T21:35:00.000Z',
    })
    lastMessageCreatedAt?: string;
}
