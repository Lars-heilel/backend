import { User } from '@prisma/generated/client';
import { CreateUserDto } from '../DTO/createUser.dto';
import { SafeUser } from '../Types/user.types';
import { FindUserDTO } from '../DTO/findUsers.dto';

export interface UserServiceInterface {
    createUser(DTO: CreateUserDto): Promise<SafeUser>;
    deleteUser(id: string): Promise<{ success: string }>;
    findUserByEmail(email: string): Promise<User>;
    findUserById(id: string): Promise<User>;
    publicFindUsers(DTO: FindUserDTO): Promise<SafeUser[]>;
    accountConfirmation(email: string): Promise<{ success: string }>;
    isConfirmed(email: string): Promise<boolean>;
    updatePassword(email: string, newPassword: string): Promise<{ success: string }>;
    validateUser(email: string, password: string): Promise<SafeUser | null>;
}
