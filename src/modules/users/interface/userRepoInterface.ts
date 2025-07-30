import { CreateUserDto } from '../DTO/createUser.dto';
import { confirmationDetails, SafeUser } from '../Types/user.types';
import { FindUserDTO } from '../DTO/findUsers.dto';
import { User } from '@prisma/generated/client';
export interface UserRepositoryInterface {
    create(data: CreateUserDto): Promise<SafeUser>;
    delete(email: string): Promise<{ success: 'User deleted' }>;
    publicFindUsers(data: FindUserDTO): Promise<SafeUser[]>;
    findUserByEmail(email: string): Promise<User | null>;
    findUserById(userId: string): Promise<User | null>;
    findUserByName(name: string): Promise<User | null>;
    accountConfirmation(email: string): Promise<{ success: 'account is confirmed' }>;
    isConfirmed(userId: string): Promise<confirmationDetails | null>;
    updatePassword(
        email: string,
        newHashedPassword: string,
    ): Promise<{ success: 'Password changed' }>;
}
