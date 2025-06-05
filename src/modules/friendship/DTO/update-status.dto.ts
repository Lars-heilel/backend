import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const UpdateFriendshipStatusSchema = z.object({
    type: z.enum(['ACCEPTED', 'REJECTED']),
});

export class UpdateFriendshipStatusDto extends createZodDto(UpdateFriendshipStatusSchema) {
    @ApiProperty({ enum: ['ACCEPTED', 'REJECTED'], description: 'action type' })
    type: 'ACCEPTED' | 'REJECTED';
}
