import { ApiProperty } from '@nestjs/swagger';
import { Message } from '@prisma/generated/client';
import { SafeUser } from '@src/modules/users/Types/user.types';

export class AllChatRoomReturnDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    updatedAt: Date;

    @ApiProperty()
    participant: SafeUser;

    @ApiProperty()
    lastMessage: Message | null;

    @ApiProperty()
    unreadCount: number;
}
