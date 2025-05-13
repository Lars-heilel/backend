import {
    ConflictException,
    Injectable,
    Logger,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { BcryptService } from '../security/bcrypt/bcrypt.service';
import { User } from 'prisma/generated';
import { RegisterDto } from '../auth/DTO/RegisterUserDto';
import { PasswordRegex } from 'src/common/const/Password_validation_regex';
import { FindUserDTO } from './DTO/findUsers.dto';

const userSelectFields = {
    email: true,
    createdAt: true,
    name: true,
    isConfirmed: true,
    id: true,
};

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);
    constructor(
        private prisma: PrismaService,
        private bcrypt: BcryptService,
    ) {}

    async createUser(DTO: RegisterDto) {
        this.logger.debug(`Создание записи о пользователе ${DTO.email} в бд`);
        const existingUser = await this.prisma.user.findUnique({
            where: { email: DTO.email.toString().toLowerCase() },
        });
        if (existingUser) throw new ConflictException('Пользователь с таким email уже существует');
        const hashedPassword = await this.bcrypt.hash(DTO.password);
        const user = this.prisma.user.create({
            data: {
                email: DTO.email.toString().toLowerCase(),
                name: DTO.name,
                password: hashedPassword,
            },
            select: userSelectFields,
        });
        this.logger.log(`Пользователь успешно создан `);
        return user;
    }
    async deleteUser(email: string) {
        const user = this.findUserByEmail(email);
        this.logger.debug(`Удаления данных о пользователе:${email} из бд`);
        if (!user) throw new ConflictException('Такого пользователя не существует');
        await this.prisma.user.delete({ where: { email: email } });
        this.logger.log(`Запись удалена`);
        return { success: `Пользователь удален` };
    }
    async findUserByEmail(email: string) {
        this.logger.debug(`Поиск данных о пользователе в базе`);
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
    async findUsers(user: FindUserDTO) {
        return await this.prisma.user.findFirst({
            where: { OR: [{ email: user.email }, { id: user.id }, { name: user.name }] },
            select: { email: true, name: true, id: true },
        });
    }
    async confirmEmail(email: string) {
        this.logger.debug(`Начало процесса изменения статуса пользователя ${email} на активен`);
        await this.findUserByEmail(email);

        return await this.prisma.user.update({
            where: { email: email },
            data: { isConfirmed: true },
        });
    }
    async isConfirmed(userId: string) {
        this.logger.debug(`Проверка активации аккаунта`);
        const user = await this.findUserById(userId);
        this.logger.log(`Статус пользователя ${user.email}:${user.isConfirmed}`);
        return user.isConfirmed;
    }
    async updatePassword(email: string, newPassword: string) {
        this.logger.debug(`Обновление пароля пользователя ${email}`);
        const user = await this.findUserByEmail(email);
        if (!user) {
            throw new NotFoundException('Пользователь не найден');
        }
        const isSamePassword = await this.bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            throw new ConflictException('Новый пароль совпадает с текущим');
        }
        const hashedPassword = await this.bcrypt.hash(newPassword);
        await this.prisma.user.update({
            where: { email: email },
            data: { password: hashedPassword },
        });
        return { success: `Пароль пользователя ${user.email} успешно изменен` };
    }
    async validateUser(email: string, password: string): Promise<Omit<User, 'password'> | null> {
        const user = await this.findUserByEmail(email);
        if (!user) throw new UnauthorizedException('Пользователь не зарегестрирован');
        const check = await this.isConfirmed(user.id);

        if (!check) throw new UnauthorizedException(`Аккаунт ${user.email} не подтвержден`);

        const comparePassword = await this.bcrypt.compare(password, user.password);
        if (!comparePassword) throw new UnauthorizedException('Неверный пароль');
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}
