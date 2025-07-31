import { z } from 'zod';

export const RefreshTokenSchema = z.string().jwt().min(1);

export type RefreshTokenDto = z.infer<typeof RefreshTokenSchema>;
