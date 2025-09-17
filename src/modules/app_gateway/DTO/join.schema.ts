import z from 'zod';

export const JoinRoomSchema = z.object({
    roomId: z.string(),
});
