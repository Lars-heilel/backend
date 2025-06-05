import {
    ConflictException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';

import { User } from 'prisma/generated';
import { FindUserDTO } from './DTO/findUsers.dto';
import { UserRepositoryAbstract } from './repositories/user.repository.abstract';
import { EncryptionAbstract } from 'src/core/security/encryption/encryption.abstract';
import { CreateUserDto } from './DTO/createUser.dto';
import { SafeUser } from './Types/user.types';
import { PublicUserDto } from './DTO/publicProfile.dto';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(
        private readonly userRepo: UserRepositoryAbstract,
        private encryption: EncryptionAbstract,
    ) {}

    async createUser(DTO: CreateUserDto) {
        this.logger.debug(`Starting registration for email: ${DTO.email}`);
        try {
            const [existingUser, existingNameUser] = await Promise.all([
                await this.userRepo.findUserByEmail(DTO.email),
                await this.userRepo.findUserByName(DTO.name),
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
        } catch (error) {
            this.logger.error(`Registration failed for ${DTO.email}`, {
                error: error.message,
                stack: error.stack,
            });
            if (error instanceof ConflictException) throw error;
            throw new InternalServerErrorException('Registration process failed');
        }
    }

    async deleteUser(email: string) {
        this.logger.debug(`Starting user deletion process for: ${email}`);
        try {
            const user = await this.userRepo.findUserByEmail(email);
            if (!user) {
                this.logger.warn(`User not found for deletion: ${email}`);
                throw new NotFoundException('User not found');
            }

            this.logger.verbose(`Deleting user ID: ${user.id} Email: ${email}`);
            await this.userRepo.delete(email);

            this.logger.log(`User deleted successfully - ID: ${user.id} Email: ${email}`);
            return { success: `User ${email} deleted` };
        } catch (error) {
            this.logger.error(`User deletion failed for ${email}`, {
                error: error.message,
                stack: error.stack,
            });
            if (error instanceof NotFoundException) throw error;
            throw new InternalServerErrorException('User deletion failed');
        }
    }

    async findUserByEmail(email: string) {
        this.logger.debug(`Searching user by email: ${email}`);
        try {
            const user = await this.userRepo.findUserByEmail(email);
            if (!user) {
                this.logger.verbose(`User not found by email: ${email}`);
                throw new NotFoundException('User not found');
            } else {
                this.logger.verbose(`User found: ID ${user.id} (${email})`);
            }
            return user;
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            this.logger.error(`User search by email failed: ${email}`, error.stack);
            throw new InternalServerErrorException('User search failed');
        }
    }

    async findUserById(userId: string) {
        this.logger.debug(`Searching user by ID: ${userId}`);
        try {
            const user = await this.userRepo.findUserById(userId);
            if (!user) {
                this.logger.verbose(`User not found by ID: ${userId}`);
                throw new NotFoundException('User not found');
            }
            this.logger.verbose(`User found: ${user.email} (ID: ${userId})`);
            return user;
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            this.logger.error(`User search by ID failed: ${userId}`, error.stack);
            throw new InternalServerErrorException('User search failed');
        }
    }

    async publicFindUsers(data: FindUserDTO): Promise<PublicUserDto[]> {
        this.logger.debug(`Public user search: ${JSON.stringify(data)}`);
        try {
            const users = await this.userRepo.publicFindUsers(data);

            if (users.length === 0) {
                this.logger.warn('User not found', { data });
            } else {
                this.logger.verbose(`Found user: ${users[0].id} ${users[0].name}`);
            }
            return users;
        } catch (error) {
            this.logger.error('User search failed', {
                error: error.message,
                data,
                stack: error.stack,
            });
            throw new InternalServerErrorException('User search failed');
        }
    }

    async accountConfirmation(email: string) {
        this.logger.debug(`Confirming account: ${email}`);
        try {
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
        } catch (error) {
            this.logger.error(`Account confirmation failed for ${email}`, {
                error: error.message,
                stack: error.stack,
            });
            if (error instanceof NotFoundException || error instanceof ConflictException) {
                throw error;
            }
            throw new InternalServerErrorException('Account confirmation failed');
        }
    }

    async isConfirmed(userId: string) {
        this.logger.debug(`Checking confirmation status for user ID: ${userId}`);
        try {
            const user = await this.userRepo.isConfirmed(userId);
            if (!user) {
                this.logger.warn(`Confirmation check failed - user not found: ${userId}`);
                throw new NotFoundException('User not found');
            }

            this.logger.log(`Confirmation status for ${user.email}: ${user.isConfirmed}`);
            return user.isConfirmed;
        } catch (error) {
            this.logger.error(`Confirmation check failed for user ID: ${userId}`, {
                error: error.message,
                stack: error.stack,
            });
            if (error instanceof NotFoundException) throw error;
            throw new InternalServerErrorException('Confirmation check failed');
        }
    }

    async updatePassword(email: string, newPassword: string) {
        this.logger.debug(`Updating password for: ${email}`);
        try {
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
        } catch (error) {
            this.logger.error(`Password update failed for ${email}`, {
                error: error.message,
                stack: error.stack,
            });
            if (error instanceof NotFoundException || error instanceof ConflictException) {
                throw error;
            }
            throw new InternalServerErrorException('Password update failed');
        }
    }

    async validateUser(email: string, password: string): Promise<Omit<User, 'password'> | null> {
        this.logger.debug(`Validating user: ${email}`);
        try {
            const user = await this.findUserByEmail(email);
            if (!user) {
                this.logger.warn(`Validation failed - user not found: ${email}`);
                throw new UnauthorizedException('User not registered');
            }

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
        } catch (error) {
            this.logger.error(`User validation failed for ${email}`, {
                error: error.message,
                stack: error.stack,
            });
            if (error instanceof UnauthorizedException) throw error;
            throw new InternalServerErrorException('User validation failed');
        }
    }
}
