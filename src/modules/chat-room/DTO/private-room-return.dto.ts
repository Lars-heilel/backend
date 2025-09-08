import { ApiProperty } from '@nestjs/swagger';

export class ChatRoomResponseDto {
    @ApiProperty({
        description: 'Unique identifier of the chat room',
        example: 'f0e1d2c3-b4a5-6789-0123-456789abcdef',
    })
    id: string;

    @ApiProperty({
        description: 'Creation timestamp of the chat room',
        example: '2023-10-27T10:00:00.000Z',
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Last update timestamp of the chat room',
        example: '2023-10-27T11:30:00.000Z',
    })
    updatedAt: Date;
}
