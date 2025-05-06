import { PasswordRegex } from 'src/common/const/Password_validation_regex';
import { z } from 'zod';

export const RegisterSchema = z.object({
    email: z.string().email(),
    name: z.string().min(2),
    password: z
        .string()
        .regex(PasswordRegex.REGEX, PasswordRegex.MESSAGE)
        .min(PasswordRegex.MIN_LENGTH),
});
