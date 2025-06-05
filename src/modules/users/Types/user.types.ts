import { User } from 'prisma/generated';

export type SafeUser = Pick<User, 'id' | 'email' | 'name' | 'isConfirmed' | 'createdAt'>;
export type confirmationDetails = Pick<User, 'isConfirmed' | 'email'>;
