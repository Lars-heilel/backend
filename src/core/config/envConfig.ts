import { z } from 'zod';
export const envSchema = z.object({
    //server
    PORT: z.coerce.number(),
    //db
    DATABASE_URL: z.string(),
    //jwt
    JWT_SECRET: z.string(),
    JWT_EXPIRES: z.string(),
    JWT_SECRET_REFRESH: z.string(),
    JWT_REFRESH_EXPIRES: z.string(),
    //nodemailer
    NODEMAILER_PASSWORD: z.string(),
    NODEMAILER_HOST: z.string(),
    NODEMAILER_EMAIL: z.string(),
    //bcrypt
    SALT_ROUNDS: z.coerce.number(),
    //FRONTEND
    CLIENT_URL: z.string().url(),
    //Email Verification
    EMAIL_CONFIRMATION_URL: z.string().url(),
    PASSWORD_RESET_URL: z.string().url(),
    EMAIL_TOKEN_EXPIRES: z.string(),
    PASSWORD_RESET_EXPIRES: z.string(),
});

export type Env = z.infer<typeof envSchema>;
