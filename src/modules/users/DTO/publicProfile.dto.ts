import { ApiProperty } from '@nestjs/swagger';

export class PublicUserDto {
    @ApiProperty({
        example: '550e8400-e29b-41d4-a716-446655440000',
        description: 'Unique user identifier',
    })
    id: string;

    @ApiProperty({
        example: 'user@example.com',
        description: 'User email address',
    })
    email: string;

    @ApiProperty({
        example: 'John Doe',
        description: 'User display name',
    })
    name: string;
}
