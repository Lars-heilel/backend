import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const SendMessageGatewaySchema = z.object({
    receiverId: z.string().uuid(),
    content: z.string().min(1).max(2000),
});
export class SendMessageGatewayDto extends createZodDto(SendMessageGatewaySchema) {}
