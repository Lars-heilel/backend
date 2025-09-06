import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
export const CreatePrivateRoomSchema = z.object({
    friendId: z.string().uuid({ message: 'Invalid friend ID format' }),
});

export class CreatePrivateRoomDto extends createZodDto(CreatePrivateRoomSchema) {}
