import { EncryptionInterface } from '@src/core/security/encryption/interface/encryprion.interface';
import { UserRepositoryInterface } from '../../interface/userRepoInterface';

export const mockUserRepo: jest.Mocked<UserRepositoryInterface> = {
    findUserByEmail: jest.fn(),
    findUserByName: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    findUserById: jest.fn(),
    publicFindUsers: jest.fn(),
    accountConfirmation: jest.fn(),
    isConfirmed: jest.fn(),
    updatePassword: jest.fn(),
};

export const mockEncryption: jest.Mocked<EncryptionInterface> = {
    hash: jest.fn(),
    compare: jest.fn(),
};
