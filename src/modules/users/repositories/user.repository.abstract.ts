import { User } from 'prisma/generated';
import { CreateUserDto } from '../DTO/createUser.dto';
import { confirmationDetails, SafeUser } from '../Types/user.types';
import { FindUserDTO } from '../DTO/findUsers.dto';
import { PublicUserDto } from '../DTO/publicProfile.dto';

export abstract class UserRepositoryAbstract {
    abstract create(data: CreateUserDto): Promise<SafeUser>;
    abstract delete(email: string): Promise<{ success: `User deleted` }>;
    abstract publicFindUsers(data: FindUserDTO): Promise<PublicUserDto[]>;
    abstract findUserByEmail(email: string): Promise<User | null>;
    abstract findUserById(userId: string): Promise<User | null>;
    abstract findUserByName(name: string): Promise<User | null>;
    abstract accountConfirmation(email: string): Promise<{ success: 'account is confirmed' }>;
    abstract isConfirmed(userId: string): Promise<confirmationDetails | null>;
    abstract updatePassword(
        email: string,
        newHashedPassword: string,
    ): Promise<{ success: 'Password changed' }>;
}
