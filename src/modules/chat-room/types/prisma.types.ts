import { Prisma } from '@prisma/generated/client';
import { USER_SELECT_FIELDS } from '@src/modules/users/const/user.prisma.constants';
export const userRoomsArgs = Prisma.validator<Prisma.ChatRoomFindManyArgs>()({
    include: {
        participants: {
            include: {
                user: {
                    select: USER_SELECT_FIELDS,
                },
            },
        },
        messages: {
            orderBy: {
                createAt: 'desc',
            },
            take: 1,
        },
        _count: {
            select: {
                messages: {
                    where: {
                        read: false,
                    },
                },
            },
        },
    },
    orderBy: {
        updatedAt: 'desc',
    },
});
export type ChatRoomWithDetails = Prisma.ChatRoomGetPayload<typeof userRoomsArgs>;
