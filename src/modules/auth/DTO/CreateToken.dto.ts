import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
const CreateTokenSchema = z.object({
    email: z.string(),
    id: z.string(),
});
export class CreateToken extends createZodDto(CreateTokenSchema) {
    email: string;
    id: string;
}
