import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Env } from 'src/core/config/envConfig';
import { EmailTemplate } from './UI/EmailTemplate';
import { $getFrontUrl, $endpoints } from 'src/common/const/$frontendUrl';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { randomBytes } from 'crypto';
import { CreateToken } from 'src/modules/auth/DTO/CreateToken.dto';

@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter;
    private readonly logger = new Logger(EmailService.name);
    constructor(
        private env: ConfigService<Env>,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) {
        this.transporter = nodemailer.createTransport({
            host: this.env.get('NODEMAILER_HOST'),
            port: 465,
            secure: true,
            auth: {
                user: this.env.get('NODEMAILER_EMAIL'),
                pass: this.env.get('NODEMAILER_PASSWORD'),
            },
        });
    }
    async sendConfirmationEmail(user: CreateToken, type: 'confirm') {
        this.logger.debug(`Отправляем письмо ${type} пользователю ${user.email}`);
        try {
            const token = await this.generateAndCacheTokens(user, type);
            const url = `${$getFrontUrl($endpoints.email.confirmEmail)}?token=${token}`;
            this.logger.log(`Итоговый адрес с токеном:${url}`);
            await this.transporter.sendMail({
                from: `${this.env.get('APP_NAME')}<${this.env.get('NODEMAILER_EMAIL')}>`,
                to: user.email,
                subject: 'Подтверждение email',
                html: EmailTemplate.confirmEmail(url),
            });
            this.logger.log('Отправлено');
        } catch (error) {
            this.logger.error(`Ошибка при отправлении:${error}`);
        }
    }
    async sendResetPasswordEmail(user: CreateToken, type: 'reset') {
        this.logger.debug(`Отправляем письмо ${type} пользователю ${user.email}`);
        try {
            const token = await this.generateAndCacheTokens(user, type);
            const url = `${$getFrontUrl($endpoints.email.resetPassword)}?token=${token}`;
            this.logger.log(`Итоговый адрес с токеном:${url}`);
            await this.transporter.sendMail({
                from: `${this.env.get('APP_NAME')}<${this.env.get('NODEMAILER_EMAIL')}>`,
                to: user.email,
                subject: 'Сброс пароля',
                html: EmailTemplate.resetPasswordEmail(url),
            });
            this.logger.log('Отправлено');
        } catch (error) {
            this.logger.error(`Ошибка при отправлении:${error}`);
        }
    }

    private async generateAndCacheTokens(user: CreateToken, type: 'confirm' | 'reset') {
        try {
            this.logger.log(`Начало генерации ${type} токена для пользователя ${user.id}`);

            const oldTokenKey = `${type}:user:${user.id}`;
            this.logger.debug(`Поиск старого токена по ключу: ${oldTokenKey}`);

            const oldToken = await this.cacheManager.get(oldTokenKey);
            if (oldToken) {
                this.logger.debug(
                    `Найден существующий ${type} токен [${oldToken}] для пользователя ${user.id}`,
                );

                const oldTokenCacheKey = `${type}:${oldToken}`;
                this.logger.debug(`Удаление старого токена из кэша по ключу: ${oldTokenCacheKey}`);
                await this.cacheManager.del(oldTokenCacheKey);
            }

            const token = randomBytes(32).toString('hex');
            const ttl = type === 'confirm' ? 3600 * 1000 : 900 * 1000;
            this.logger.debug(`Сгенерирован новый ${type} токен [${token}], TTL: ${ttl}ms`);

            const cacheKey = `${type}:${token}`;
            this.logger.debug(`Сохранение токена в кэш по ключу: ${cacheKey}`);
            await this.cacheManager.set(cacheKey, user, ttl);

            this.logger.debug(`Обновление ссылки на токен пользователя по ключу: ${oldTokenKey}`);
            await this.cacheManager.set(oldTokenKey, token, ttl);

            this.logger.log(`Успешная генерация ${type} токена для пользователя ${user.id}`);
            return token;
        } catch (error) {
            this.logger.error(`Ошибка генерации ${type} токена для пользователя ${user.id}`);
            this.logger.error(`Детали ошибки: ${error.stack}`);
            throw error;
        }
    }
    async validateToken(type: 'confirm' | 'reset', token: string) {
        this.logger.debug(`Проверка токена:${type},${token}`);
        try {
            const cacheKey = `${type}:${token}`;
            const user = await this.cacheManager.get<CreateToken>(cacheKey);
            this.logger.log(`Данные о пользователе [${user?.email},${user?.id}] из кэша`);
            if (!user) {
                throw new UnauthorizedException('Недействительный или просроченный токен');
            }
            this.logger.log('Очистка кэша');
            return user;
        } catch (error) {
            throw new Error(`Ошибка валидации ${error}`);
        }
    }
    async revokeToken(type: 'confirm' | 'reset', token: string) {
        const cacheKey = `${type}:${token}`;
        await this.cacheManager.del(cacheKey);
    }
}
