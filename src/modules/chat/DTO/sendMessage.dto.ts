import { z } from 'zod';
export const SendMessageSchema = z.object({
    receiverId: z.string().uuid(),
    content: z
        .string()
        .min(1, 'Message cannot be empty')
        .max(2000, 'Message exceeds 2000 characters limit'),
});
