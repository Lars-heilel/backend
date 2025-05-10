import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { PasswordRegex } from 'src/common/const/Password_validation_regex';

export const ResetPasswordSchema = z.object({
    password: z
        .string()
        .regex(PasswordRegex.REGEX, PasswordRegex.MESSAGE)
        .min(PasswordRegex.MIN_LENGTH),
});

export class ResetPasswordDto extends createZodDto(ResetPasswordSchema) {}
