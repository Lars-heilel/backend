import { SafeUser } from '../../Types/user.types';
import { User } from '@prisma/generated/client';

export const mockDeleteUserId = '9044dcc8-7dea-4d21-8c1a-5009ac2c2ece';

export const mockSafeUser: SafeUser = {
    id: mockDeleteUserId,
    email: 'test@example.com',
    name: 'testuser',
    isConfirmed: false,
    createdAt: new Date(),
};

export const mockSafeUserList: SafeUser[] = [
    mockSafeUser,
    { ...mockSafeUser, id: 'user-2-id', email: 'user2@example.com', name: 'user2' },
];

export const mockFullUser: User = {
    ...mockSafeUser,
    password: 'hashedPassword',
    lastSeen: null,
};

export const mockConfirmedUser: User = {
    ...mockFullUser,
    isConfirmed: true,
};
