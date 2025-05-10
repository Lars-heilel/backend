import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import { Response } from 'express';
import { PrismaService } from 'prisma/prisma.service';
import { CreateToken } from 'src/modules/auth/DTO/CreateToken.dto';

@Injectable()
export class RefreshTokenService {
    private readonly logger = new Logger(RefreshTokenService.name);

    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
    ) {}

    async setRefreshTokenCookie(res: Response, token: string) {
        this.logger.debug('Установка refresh токена в cookie');
        res.cookie('refreshToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
    }

    async generateRefreshToken(user: CreateToken) {
        this.logger.log(`Генерация refresh токена `);
        try {
            const payload = { email: user.email, sub: user.id };
            const refreshToken = this.jwt.sign(payload);

            await this.prisma.$transaction(async (tx) => {
                this.logger.debug(`Удаление старых токенов `);
                await tx.token.deleteMany({ where: { userId: user.id } });

                this.logger.debug(`Создание нового токена  `);
                await tx.token.create({
                    data: {
                        refreshToken: refreshToken,
                        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                        userId: user.id,
                    },
                });
            });

            this.logger.log(`Успешная генерация refresh токена  `);
            return refreshToken;
        } catch (error) {
            this.logger.error(`Ошибка генерации токена для пользователя `, error.stack);
            throw error;
        }
    }

    async validateRefreshToken(token: string) {
        this.logger.debug(`Валидация токена: ${token.substring(0, 6)}...`);
        try {
            await this.jwt.verify(token);
            const storedToken = await this.prisma.token.findFirst({
                where: { refreshToken: token },
            });

            if (!storedToken) {
                this.logger.warn(`Токен не найден в БД: ${token.substring(0, 6)}...`);
                throw new UnauthorizedException('Токен не обнаружен');
            }

            const now = new Date();
            if (storedToken.expiresAt < now) {
                this.logger.warn(
                    `Обнаружен просроченный токен пользователя ID: ${storedToken.userId}`,
                );
                await this.prisma.token.delete({ where: { id: storedToken.id } });
                throw new UnauthorizedException('Просроченный токен');
            }

            this.logger.log(`Токен успешно валидирован для пользователя ID: ${storedToken.userId}`);
            return storedToken.userId;
        } catch (error) {
            if (error instanceof TokenExpiredError) {
                this.logger.warn('Попытка использования просроченного токена');
                throw new UnauthorizedException('Токен просрочен');
            }
            if (error instanceof JsonWebTokenError) {
                this.logger.warn(`Невалидная подпись токена: ${error.message}`);
                throw new UnauthorizedException('Невалидная подпись токена');
            }
            this.logger.error(
                `Непредвиденная ошибка при валидации токена: ${error.message}`,
                error.stack,
            );
            throw error;
        }
    }

    async revokeRefreshToken(userId: string) {
        this.logger.log(`Отзыв токена`);
        try {
            await this.prisma.token.deleteMany({ where: { userId: userId } });
            this.logger.debug('Токен успешно отозван');
        } catch (error) {
            this.logger.error(`Ошибка при отзыве токена: ${error.message}`, error.stack);
            throw error;
        }
    }
}
