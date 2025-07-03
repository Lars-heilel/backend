import { User } from '@prisma/generated/client';

export type SafeUser = Pick<User, 'id' | 'email' | 'name' | 'isConfirmed' | 'createdAt'>;
export type confirmationDetails = Pick<User, 'isConfirmed' | 'email'>;
