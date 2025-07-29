import {
    ConflictException,
    Injectable,
    Logger,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';

import { User } from '@prisma/generated/client';
import { FindUserDTO } from './DTO/findUsers.dto';
import { UserRepositoryAbstract } from './repositories/user.repository.abstract';
import { EncryptionAbstract } from 'src/core/security/encryption/encryption.abstract';
import { CreateUserDto } from './DTO/createUser.dto';
import { SafeUser } from './Types/user.types';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(
        private readonly userRepo: UserRepositoryAbstract,
        private readonly encryption: EncryptionAbstract,
    ) {}

    async createUser(DTO: CreateUserDto): Promise<SafeUser> {
        this.logger.debug(`Starting registration for email: ${DTO.email}`);

        const [existingUser, existingNameUser] = await Promise.all([
            this.userRepo.findUserByEmail(DTO.email),
            this.userRepo.findUserByName(DTO.name),
        ]);

        if (existingUser) {
            this.logger.warn(`Registration conflict - Email already exists: ${DTO.email}`);
            throw new ConflictException('User already exists');
        }
        if (existingNameUser) {
            this.logger.warn(`Registration conflict: Name already taken - ${DTO.name}`);
            throw new ConflictException('Name already exists');
        }

        this.logger.debug(`Hashing password for: ${DTO.email}`);
        const hashedPassword = await this.encryption.hash(DTO.password);
        const userData = {
            email: DTO.email,
            name: DTO.name,
            password: hashedPassword,
        };

        this.logger.verbose(`Creating user record: ${DTO.email}`);
        const user = await this.userRepo.create(userData);

        this.logger.log(`User registered successfully - ID: ${user.id} Email: ${user.email}`);
        return user;
    }
    async deleteUser(email: string): Promise<{ success: string }> {
        this.logger.debug(`Starting user deletion process for: ${email}`);

        const user = await this.userRepo.findUserByEmail(email);
        if (!user) {
            this.logger.warn(`User not found for deletion: ${email}`);
            throw new NotFoundException('User not found');
        }

        this.logger.verbose(`Deleting user ID: ${user.id} Email: ${email}`);
        await this.userRepo.delete(email);

        this.logger.log(`User deleted successfully - ID: ${user.id} Email: ${email}`);
        return { success: `User ${email} deleted` };
    }

    async findUserByEmail(email: string): Promise<User> {
        this.logger.debug(`Searching user by email: ${email}`);

        const user = await this.userRepo.findUserByEmail(email);
        if (!user) {
            this.logger.verbose(`User not found by email: ${email}`);
            throw new NotFoundException('User not found');
        } else {
            this.logger.verbose(`User found: ID ${user.id} (${email})`);
        }
        return user;
    }

    async findUserById(userId: string): Promise<User> {
        this.logger.debug(`Searching user by ID: ${userId}`);

        const user = await this.userRepo.findUserById(userId);
        if (!user) {
            this.logger.verbose(`User not found by ID: ${userId}`);
            throw new NotFoundException('User not found');
        }
        this.logger.verbose(`User found: ${user.email} (ID: ${userId})`);
        return user;
    }

    async publicFindUsers(data: FindUserDTO): Promise<SafeUser[]> {
        this.logger.debug(`Public user search: ${JSON.stringify(data)}`);

        const users = await this.userRepo.publicFindUsers(data);

        if (users.length === 0) {
            this.logger.warn('User not found', { data });
        } else {
            this.logger.verbose(`Found user: ${users[0].id} ${users[0].name}`);
        }
        return users;
    }

    async accountConfirmation(email: string): Promise<{ success: string }> {
        this.logger.debug(`Confirming account: ${email}`);

        const user = await this.findUserByEmail(email);
        if (!user) {
            this.logger.warn(`Account confirmation failed - user not found: ${email}`);
            throw new NotFoundException('User not found');
        }
        if (user.isConfirmed) {
            this.logger.warn(`Account already confirmed: ${email}`);
            throw new ConflictException('User already confirmed');
        }

        this.logger.verbose(`Updating confirmation status for: ${email}`);
        const result = await this.userRepo.accountConfirmation(email);

        this.logger.log(`Account confirmed: ${email}`);
        this.logger.verbose(`Confirmation result: ${JSON.stringify(result)}`);

        return result;
    }

    async isConfirmed(userId: string): Promise<boolean> {
        this.logger.debug(`Checking confirmation status for user ID: ${userId}`);

        const user = await this.userRepo.isConfirmed(userId);
        if (!user) {
            this.logger.warn(`Confirmation check failed - user not found: ${userId}`);
            throw new NotFoundException('User not found');
        }

        this.logger.log(`Confirmation status for ${user.email}: ${user.isConfirmed}`);
        return user.isConfirmed;
    }

    async updatePassword(email: string, newPassword: string): Promise<{ success: string }> {
        this.logger.debug(`Updating password for: ${email}`);

        const user = await this.findUserByEmail(email);
        if (!user) {
            this.logger.warn(`Password update failed - user not found: ${email}`);
            throw new NotFoundException('User not found');
        }

        const isSamePassword = await this.encryption.compare(newPassword, user.password);
        if (isSamePassword) {
            this.logger.warn(`Password update failed - same as current: ${email}`);
            throw new ConflictException('New password matches current password');
        }

        this.logger.debug(`Hashing new password for: ${email}`);
        const hashedPassword = await this.encryption.hash(newPassword);

        await this.userRepo.updatePassword(email, hashedPassword);
        this.logger.log(`Password updated successfully for: ${email}`);
        return { success: `Password updated for ${email}` };
    }

    async validateUser(email: string, password: string): Promise<Omit<User, 'password'> | null> {
        this.logger.debug(`Validating user: ${email}`);

        const user = await this.findUserByEmail(email);
        if (!user.isConfirmed) {
            this.logger.warn(`Validation failed - account not confirmed: ${email}`);
            throw new UnauthorizedException('Account not confirmed');
        }

        const passwordValid = await this.encryption.compare(password, user.password);
        if (!passwordValid) {
            this.logger.warn(`Validation failed - invalid password for: ${email}`);
            throw new UnauthorizedException('Invalid credentials');
        }

        this.logger.verbose(`User validated successfully: ${email}`);
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}
