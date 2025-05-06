import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { BcryptService } from '../security/bcrypt/bcrypt.service';

const userSelectFields = {
    email: true,
    createdAt: true,
    name: true,
    isConfirmed: true,
    id: true,
};

@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService,
        private bcrypt: BcryptService,
    ) {}

    async createUser(email: string, password: string, name: string) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser)
            throw new ConflictException(
                'Пользователь с таким email уже существует',
            );
        const hashedPassword = await this.bcrypt.hash(password);
        const user = this.prisma.user.create({
            data: { email: email, name: name, password: hashedPassword },
            select: userSelectFields,
        });
        return user;
    }
    async deleteUser(email: string) {
        const user = await this.findUserByEmail(email);
        await this.prisma.user.delete({ where: { email: email } });
        return { success: `Пользователь ${user.email} удален` };
    }
    async findUserByEmail(email: string) {
        const user = await this.prisma.user.findUnique({
            where: { email: email },
            select: userSelectFields,
        });
        if (!user) throw new NotFoundException('Пользователя не существует');
        return user;
    }
    async findUserById(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: userSelectFields,
        });
        if (!user) throw new NotFoundException('Пользователя не существует');
        return user;
    }
    async confirmEmail(userId: string) {
        await this.findUserById(userId);
        return await this.prisma.user.update({
            where: { id: userId },
            data: { isConfirmed: true },
        });
    }
    async isConfirmed(userId: string) {
        const user = await this.findUserById(userId);
        return { status: user.isConfirmed };
    }
    async updatePassword(email: string, newPassword: string) {
        const user = await this.findUserByEmail(email);
        const hashedPassword = await this.bcrypt.hash(newPassword);
        await this.prisma.user.update({
            where: { email: email },
            data: { password: hashedPassword },
        });
        return { success: `Пароль пользователя ${user.email} успешно изменен` };
    }
}
