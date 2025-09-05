import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const createPrivateRoomSchema = z
    .object({
        firstUserId: z.string().uuid({ message: 'invalid id format' }),
        secondUserId: z.string().uuid({ message: 'invalid id format' }),
    })
    .refine((userData) => userData.firstUserId !== userData.secondUserId, {
        message: 'user ids must not be the same',
        path: ['userId2'],
    });
export class CreatePrivateRoomDto extends createZodDto(createPrivateRoomSchema) {}
