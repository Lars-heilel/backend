import { PasswordRegex } from 'src/common/const/Password_validation_regex';
import { z } from 'zod';

export const LoginSchema = z.object({
    email: z.string().email().min(1),
    password: z.string().min(PasswordRegex.MIN_LENGTH),
});
