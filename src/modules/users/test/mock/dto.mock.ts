import { CreateUserDto } from '../../DTO/createUser.dto';
import { DeleteUserDTO } from '../../DTO/deleteUser.dto';
import { FindUserDTO } from '../../DTO/findUsers.dto';

export const mockCreateUserDto: CreateUserDto = {
    email: 'test@example.com',
    name: 'testuser',
    password: 'Pass$word123',
};

export const mockFindUserDto: FindUserDTO = {
    email: 'test@example.com',
    id: '3f1c0616-8b41-42ae-a456-d0c6c0f3d62b',
    name: 'testuser',
};
export const mockDeleteUserDto: DeleteUserDTO = {
    id: 'c045bdf6-0068-44ac-847f-7486b26f8ab2',
};
export const mockUpdatePassword = 'NewPass$word456';
export const mockSamePassword = 'Pass$word123';
