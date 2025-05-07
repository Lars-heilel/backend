import {
    ConflictException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { BcryptService } from '../security/bcrypt/bcrypt.service';
import { User } from 'prisma/generated';
import { RegisterDto } from '../auth/DTO/RegisterUserDto';

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

    async createUser(DTO: RegisterDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: DTO.email.toString().toLowerCase() },
        });
        if (existingUser)
            throw new ConflictException(
                'Пользователь с таким email уже существует',
            );
        const hashedPassword = await this.bcrypt.hash(DTO.password);
        const user = this.prisma.user.create({
            data: {
                email: DTO.email.toString().toLowerCase(),
                name: DTO.name,
                password: hashedPassword,
            },
            select: userSelectFields,
        });
        return user;
    }
    async deleteUser(email: string) {
        console.log(email);
        await this.prisma.user.delete({ where: { email: email } });
        return { success: `Пользователь удален` };
    }
    async findUserByEmail(email: string) {
        const user = await this.prisma.user.findUnique({
            where: { email: email },
        });

        return user;
    }
    async findUserById(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: userSelectFields,
        });
        if (!user) {
            throw new NotFoundException('Пользователь не найден');
        }
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
        if (!user) {
            throw new NotFoundException('Пользователь не найден');
        }
        const hashedPassword = await this.bcrypt.hash(newPassword);
        await this.prisma.user.update({
            where: { email: email },
            data: { password: hashedPassword },
        });
        return { success: `Пароль пользователя ${user.email} успешно изменен` };
    }
    async validateUser(
        email: string,
        password: string,
    ): Promise<Omit<User, 'password'> | null> {
        const user = await this.findUserByEmail(email);
        if (!user)
            throw new UnauthorizedException('Пользователь не зарегестрирован');
        const comparePassword = await this.bcrypt.compare(
            password,
            user.password,
        );
        console.log(comparePassword);
        if (!comparePassword)
            throw new UnauthorizedException('Неверный пароль');
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}
