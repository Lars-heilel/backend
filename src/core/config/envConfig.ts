import { z } from 'zod';
export const envSchema = z.object({
    //server
    PORT: z.coerce.number(),
    APP_NAME: z.string(),
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
    CLIENT_URL: z.string(),
    //Email Verification
    EMAIL_TOKEN_EXPIRES: z.string(),
    PASSWORD_RESET_EXPIRES: z.string(),
    //POSTGRESQL
    POSTGRES_USER: z.string().optional(),
    POSTGRES_PASSWORD: z.string().optional(),
    POSTGRES_DB: z.string().optional(),
    //Redis
    REDIS_URL: z.string(),
});

export type Env = z.infer<typeof envSchema>;

export function validate(config: Record<string, unknown>): Env {
    try {
        return envSchema.parse(config);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const messages = error.issues
                .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
                .join('\n');
            throw new Error(`Configuration validation failed:\n${messages}`);
        }
        throw new Error('Unknown error during configuration validation');
    }
}
