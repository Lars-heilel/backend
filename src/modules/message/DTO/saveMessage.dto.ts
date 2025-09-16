import { z } from 'zod';
export const SaveMessageSchema = z.object({
    userId: z.string(),
    chatRoomId: z.string(),
    content: z
        .string()
        .min(1, 'Message cannot be empty')
        .max(2000, 'Message exceeds 2000 characters limit'),
});
export type SaveMessageDto = z.infer<typeof SaveMessageSchema>;
