import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { PasswordRegex } from 'src/common/const/Password_validation_regex';
import { z } from 'zod';

export const LoginSchema = z.object({
    email: z.string().email().min(1),
    password: z
        .string()
        .regex(PasswordRegex.REGEX, PasswordRegex.MESSAGE)
        .min(PasswordRegex.MIN_LENGTH),
});
export class LoginDto extends createZodDto(LoginSchema) {
    @ApiProperty({
        description: 'User email address',
        example: 'user@example.com',
        format: 'email',
    })
    email: string;

    @ApiProperty({
        description: 'User password',
        example: 'P@ssw0rd123',
        minLength: PasswordRegex.MIN_LENGTH,
        pattern: PasswordRegex.REGEX.source,
    })
    password: string;
}
