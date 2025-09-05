import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const getUserRoomsSchema = z.object({
    userId: z.string().uuid({ message: 'invalid id format' }),
});
export class GetUserRoomsDto extends createZodDto(getUserRoomsSchema) {}
