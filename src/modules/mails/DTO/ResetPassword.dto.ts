import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { PasswordRegex } from 'src/common/const/Password_validation_regex';
import { ApiProperty } from '@nestjs/swagger';

export const ResetPasswordSchema = z.object({
    password: z
        .string()
        .regex(PasswordRegex.REGEX, PasswordRegex.MESSAGE)
        .min(PasswordRegex.MIN_LENGTH),
});

export class ResetPasswordDto extends createZodDto(ResetPasswordSchema) {
    @ApiProperty({
        description: 'New password',
        example: 'NewSecurePassword123!',
        pattern: PasswordRegex.REGEX.toString(),
        minLength: PasswordRegex.MIN_LENGTH,
    })
    password: string;
}
