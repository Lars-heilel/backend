import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const isUserInRoomParamsSchema = z.object({
    userId: z.string().uuid({ message: 'invalid id format' }),
    roomId: z.string().uuid({ message: 'invalid id format' }),
});
export class isUserInRoomDto extends createZodDto(isUserInRoomParamsSchema) {}
