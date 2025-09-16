import { z } from 'zod';
export const JwtTokenAuthSchema = z.object({
    token: z.string().jwt().min(1, 'Token is required'),
});
