import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CreateUserDto } from '../DTO/createUser.dto';
import { USER_SELECT_FIELDS } from '../const/user.prisma.constants';
import { confirmationDetails, SafeUser } from '../Types/user.types';
import { FindUserDTO } from '../DTO/findUsers.dto';
import { User } from '@prisma/generated/client';
import { UserRepositoryAbstract } from './user.repository.abstract';

@Injectable()
export class UserPrismaRepository extends UserRepositoryAbstract {
    constructor(private prisma: PrismaService) {
        super();
    }

    async create(data: CreateUserDto): Promise<SafeUser> {
        return this.prisma.user.create({
            data: { email: data.email, name: data.name, password: data.password },
            select: USER_SELECT_FIELDS,
        });
    }
    async delete(email: string): Promise<{ success: 'User deleted' }> {
        await this.prisma.user.delete({ where: { email } });
        return { success: 'User deleted' };
    }
    async publicFindUsers(data: FindUserDTO): Promise<SafeUser[]> {
        const user = await this.prisma.user.findFirst({
            where: {
                isConfirmed: true,
                OR: [{ email: data.email }, { id: data.id }, { name: data.name }],
            },
            select: USER_SELECT_FIELDS,
        });
        return user ? [user] : [];
    }
    async findUserByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { email } });
    }
    async findUserById(userId: string): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { id: userId } });
    }
    async findUserByName(name: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { name },
        });
    }
    async accountConfirmation(email: string): Promise<{ success: 'account is confirmed' }> {
        await this.prisma.user.update({
            where: { email: email },
            data: { isConfirmed: true },
        });
        return { success: 'account is confirmed' };
    }
    async isConfirmed(userId: string): Promise<confirmationDetails | null> {
        return await this.prisma.user.findUnique({
            where: { id: userId },
            select: { isConfirmed: true, email: true },
        });
    }
    async updatePassword(
        email: string,
        newHashedPassword: string,
    ): Promise<{ success: 'Password changed' }> {
        await this.prisma.user.update({
            where: { email: email },
            data: { password: newHashedPassword },
        });
        return { success: 'Password changed' };
    }
}
