import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
export const FindUserSchema = z.object({
    email: z.string().email().optional(),
    name: z.string().optional(),
    id: z.string().optional(),
});
export class FindUserDTO extends createZodDto(FindUserSchema) {}
