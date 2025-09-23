import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { ENCRYPTION_SERVICE, USER_REPOSITORY } from '@src/core/config/di-token';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { mockEncryption, mockUserRepo } from './mock/service.mock';
import {
    mockCreateUserDto,
    mockDeleteUserDto,
    mockFindUserDto,
    mockSamePassword,
    mockUpdatePassword,
} from './mock/dto.mock';
import { mockConfirmedUser, mockFullUser, mockSafeUser, mockSafeUserList } from './mock/user.mock';

describe('UsersService', () => {
    let service: UsersService;

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                { provide: USER_REPOSITORY, useValue: mockUserRepo },
                { provide: ENCRYPTION_SERVICE, useValue: mockEncryption },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('createUser', () => {
        it('should successfully create a new user', async () => {
            mockUserRepo.findUserByEmail.mockResolvedValue(null);
            mockUserRepo.findUserByName.mockResolvedValue(null);
            mockEncryption.hash.mockResolvedValue('hashedPassword');
            mockUserRepo.create.mockResolvedValue(mockSafeUser);
            const result = await service.createUser(mockCreateUserDto);
            expect(mockUserRepo.findUserByEmail).toHaveBeenCalledWith(mockCreateUserDto.email);
            expect(mockUserRepo.findUserByName).toHaveBeenCalledWith(mockCreateUserDto.name);
            expect(mockEncryption.hash).toHaveBeenCalledWith(mockCreateUserDto.password);
            expect(mockUserRepo.create).toHaveBeenCalledWith({
                email: mockCreateUserDto.email,
                name: mockCreateUserDto.name,
                password: 'hashedPassword',
            });
            expect(result).toEqual(mockSafeUser);
        });
        it('should throw ConflictException if user with email already exists', async () => {
            mockUserRepo.findUserByEmail.mockResolvedValue({ ...mockFullUser, id: 'existing-id' });

            await expect(service.createUser(mockCreateUserDto)).rejects.toThrow(ConflictException);
            await expect(service.createUser(mockCreateUserDto)).rejects.toThrow(
                'User already exists',
            );

            expect(mockUserRepo.create).not.toHaveBeenCalled();
            expect(mockEncryption.hash).not.toHaveBeenCalled();
        });
        it('should throw ConflictException if user with name already exists', async () => {
            mockUserRepo.findUserByEmail.mockResolvedValue(null);
            mockUserRepo.findUserByName.mockResolvedValue({
                ...mockFullUser,
                id: 'existing-name-id',
                email: 'another@example.com',
            });

            await expect(service.createUser(mockCreateUserDto)).rejects.toThrow(ConflictException);
            await expect(service.createUser(mockCreateUserDto)).rejects.toThrow(
                'Name already exists',
            );

            expect(mockUserRepo.create).not.toHaveBeenCalled();
            expect(mockEncryption.hash).not.toHaveBeenCalled();
        });
    });

    describe('deleteUser', () => {
        it('should successfully delete a user', async () => {
            mockUserRepo.findUserById.mockResolvedValue(mockFullUser);
            mockUserRepo.delete.mockResolvedValue({ success: 'User deleted' });
            const result = await service.deleteUser(mockDeleteUserDto.id);
            expect(mockUserRepo.findUserById).toHaveBeenCalledWith(mockDeleteUserDto.id);
            expect(mockUserRepo.delete).toHaveBeenCalledWith(mockDeleteUserDto.id);
            expect(result).toEqual({ success: `User ${mockDeleteUserDto.id} deleted` });
        });
        it('sould throw NotFoundException if user undefiend', async () => {
            mockUserRepo.findUserById.mockResolvedValue(null);
            await expect(service.deleteUser(mockDeleteUserDto.id)).rejects.toThrow(
                NotFoundException,
            );
            await expect(service.deleteUser(mockDeleteUserDto.id)).rejects.toThrow(
                'User not found',
            );
            expect(mockUserRepo.delete).not.toHaveBeenCalled();
        });
    });
    describe('findUserByEmail', () => {
        it('should return user by email', async () => {
            mockUserRepo.findUserByEmail.mockResolvedValue(mockFullUser);
            const result = await service.findUserByEmail(mockFullUser.email);
            expect(mockUserRepo.findUserByEmail).toHaveBeenCalledWith(mockFullUser.email);
            expect(result).toEqual(mockFullUser);
        });
        it('should throw NotFoundException if user is not found', async () => {
            mockUserRepo.findUserByEmail.mockResolvedValue(null);
            await expect(service.findUserByEmail(mockFullUser.email)).rejects.toThrow(
                NotFoundException,
            );
            await expect(service.findUserByEmail(mockFullUser.email)).rejects.toThrow(
                'User not found',
            );
            expect(mockUserRepo.findUserByEmail).toHaveBeenCalledWith(mockFullUser.email);
        });
    });
    describe('findUserById', () => {
        it('should return user by id', async () => {
            mockUserRepo.findUserById.mockResolvedValue(mockFullUser);
            const result = await service.findUserById(mockFullUser.id);
            expect(mockUserRepo.findUserById).toHaveBeenCalledWith(mockFullUser.id);
            expect(result).toEqual(mockFullUser);
        });
        it('should throw NotFoundException if user is not found', async () => {
            mockUserRepo.findUserById.mockResolvedValue(null);
            await expect(service.findUserById(mockFullUser.id)).rejects.toThrow(NotFoundException);
            await expect(service.findUserById(mockFullUser.id)).rejects.toThrow('User not found');
            expect(mockUserRepo.findUserById).toHaveBeenCalledWith(mockFullUser.id);
        });
        describe('publicFindUsers', () => {
            it('should return an array of SafeUsers when users are found', async () => {
                mockUserRepo.publicFindUsers.mockResolvedValue(mockSafeUserList);
                const result = await service.publicFindUsers(mockFindUserDto);
                expect(mockUserRepo.publicFindUsers).toHaveBeenCalledWith(mockFindUserDto);
                expect(result).toEqual(mockSafeUserList);
            });
            it('should return an empty array if no users are found', async () => {
                mockUserRepo.publicFindUsers.mockResolvedValue([]);
                const result = await service.publicFindUsers(mockFindUserDto);
                expect(mockUserRepo.publicFindUsers).toHaveBeenCalledWith(mockFindUserDto);
                expect(result).toEqual([]);
            });
        });

        describe('accountConfirmation', () => {
            it('should successfully confirm a user account', async () => {
                mockUserRepo.findUserByEmail.mockResolvedValue(mockFullUser);
                mockUserRepo.accountConfirmation.mockResolvedValue({
                    success: 'account is confirmed',
                });
                const result = await service.accountConfirmation(mockFullUser.email);
                expect(mockUserRepo.findUserByEmail).toHaveBeenCalledWith(mockFullUser.email);
                expect(mockUserRepo.accountConfirmation).toHaveBeenCalledWith(mockFullUser.email);
                expect(result).toEqual({ success: `account is confirmed` });
            });
            it('should throw NotFoundException if user is not found', async () => {
                mockUserRepo.findUserByEmail.mockResolvedValue(null);
                await expect(service.accountConfirmation(mockFullUser.email)).rejects.toThrow(
                    NotFoundException,
                );
                await expect(service.accountConfirmation(mockFullUser.email)).rejects.toThrow(
                    'User not found',
                );
                expect(mockUserRepo.accountConfirmation).not.toHaveBeenCalled();
            });
            it('should throw ConflictException if account is already confirmed', async () => {
                mockUserRepo.findUserByEmail.mockResolvedValue(mockConfirmedUser);
                await expect(service.accountConfirmation(mockConfirmedUser.email)).rejects.toThrow(
                    ConflictException,
                );
                await expect(service.accountConfirmation(mockConfirmedUser.email)).rejects.toThrow(
                    'User already confirmed',
                );
                expect(mockUserRepo.accountConfirmation).not.toHaveBeenCalled();
            });
        });

        describe('isConfirmed', () => {
            it('should return true if the user is confirmed', async () => {
                mockUserRepo.isConfirmed.mockResolvedValue({
                    isConfirmed: true,
                    email: 'test@example.com',
                });
                const result = await service.isConfirmed(mockFullUser.id);
                expect(mockUserRepo.isConfirmed).toHaveBeenCalledWith(mockFullUser.id);
                expect(result).toBe(true);
            });
            it('should return false if the user is not confirmed', async () => {
                mockUserRepo.isConfirmed.mockResolvedValue({
                    isConfirmed: false,
                    email: 'test@example.com',
                });
                const result = await service.isConfirmed(mockFullUser.id);
                expect(mockUserRepo.isConfirmed).toHaveBeenCalledWith(mockFullUser.id);
                expect(result).toBe(false);
            });
            it('should throw NotFoundException if the user is not found', async () => {
                mockUserRepo.isConfirmed.mockResolvedValue(null);
                await expect(service.isConfirmed(mockFullUser.id)).rejects.toThrow(
                    NotFoundException,
                );
                await expect(service.isConfirmed(mockFullUser.id)).rejects.toThrow(
                    'User not found',
                );
                expect(mockUserRepo.isConfirmed).toHaveBeenCalledWith(mockFullUser.id);
            });
        });

        describe('updatePassword', () => {
            it('should successfully update the user password', async () => {
                mockUserRepo.findUserByEmail.mockResolvedValue(mockFullUser);
                mockEncryption.compare.mockResolvedValue(false);
                mockEncryption.hash.mockResolvedValue('newHashedPassword');
                mockUserRepo.updatePassword.mockResolvedValue({ success: 'Password changed' });
                const result = await service.updatePassword(mockFullUser.email, mockUpdatePassword);
                expect(mockUserRepo.findUserByEmail).toHaveBeenCalledWith(mockFullUser.email);
                expect(mockEncryption.compare).toHaveBeenCalledWith(
                    mockUpdatePassword,
                    mockFullUser.password,
                );
                expect(mockEncryption.hash).toHaveBeenCalledWith(mockUpdatePassword);
                expect(mockUserRepo.updatePassword).toHaveBeenCalledWith(
                    mockFullUser.email,
                    'newHashedPassword',
                );
                expect(result).toEqual({ success: `Password updated for ${mockFullUser.email}` });
            });
            it('should throw NotFoundException if user is not found', async () => {
                mockUserRepo.findUserByEmail.mockResolvedValue(null);
                await expect(
                    service.updatePassword(mockFullUser.email, mockUpdatePassword),
                ).rejects.toThrow(NotFoundException);
                await expect(
                    service.updatePassword(mockFullUser.email, mockUpdatePassword),
                ).rejects.toThrow('User not found');
                expect(mockEncryption.compare).not.toHaveBeenCalled();
                expect(mockEncryption.hash).not.toHaveBeenCalled();
                expect(mockUserRepo.updatePassword).not.toHaveBeenCalled();
            });
            it('should throw ConflictException if the new password is the same as the current one', async () => {
                mockUserRepo.findUserByEmail.mockResolvedValue(mockFullUser);
                mockEncryption.compare.mockResolvedValue(true);
                await expect(
                    service.updatePassword(mockFullUser.email, mockSamePassword),
                ).rejects.toThrow(ConflictException);
                await expect(
                    service.updatePassword(mockFullUser.email, mockSamePassword),
                ).rejects.toThrow('New password matches current password');
                expect(mockEncryption.hash).not.toHaveBeenCalled();
                expect(mockUserRepo.updatePassword).not.toHaveBeenCalled();
            });
        });

        describe('validateUser', () => {
            it('should return a SafeUser if credentials are valid and the account is confirmed', async () => {
                mockUserRepo.findUserByEmail.mockResolvedValue(mockConfirmedUser);
                mockEncryption.compare.mockResolvedValue(true);
                const result = await service.validateUser(mockConfirmedUser.email, 'Pass$word123');
                expect(mockUserRepo.findUserByEmail).toHaveBeenCalledWith(mockConfirmedUser.email);
                expect(mockEncryption.compare).toHaveBeenCalledWith(
                    'Pass$word123',
                    mockConfirmedUser.password,
                );
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { password, ...safeUser } = mockConfirmedUser;
                expect(result).toEqual(safeUser);
            });

            it('should throw ForbiddenException if the account is not confirmed', async () => {
                mockUserRepo.findUserByEmail.mockResolvedValue(mockFullUser);
                await expect(
                    service.validateUser(mockFullUser.email, 'Pass$word123'),
                ).rejects.toThrow(ForbiddenException);
                await expect(
                    service.validateUser(mockFullUser.email, 'Pass$word123'),
                ).rejects.toThrow('Account not confirmed');
                expect(mockEncryption.compare).not.toHaveBeenCalled();
            });

            it('should throw ForbiddenException if the password is invalid', async () => {
                mockUserRepo.findUserByEmail.mockResolvedValue(mockConfirmedUser);
                mockEncryption.compare.mockResolvedValue(false);
                await expect(
                    service.validateUser(mockConfirmedUser.email, 'wrong-password'),
                ).rejects.toThrow(ForbiddenException);
                await expect(
                    service.validateUser(mockConfirmedUser.email, 'wrong-password'),
                ).rejects.toThrow('Invalid credentials');
            });

            it('should throw NotFoundException if user is not found', async () => {
                mockUserRepo.findUserByEmail.mockResolvedValue(null);
                await expect(
                    service.validateUser('notfound@example.com', 'password'),
                ).rejects.toThrow(NotFoundException);
                expect(mockUserRepo.findUserByEmail).toHaveBeenCalledWith('notfound@example.com');
                expect(mockEncryption.compare).not.toHaveBeenCalled();
            });
        });
    });
});
