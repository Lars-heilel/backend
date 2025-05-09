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
    this.logger.debug(`Генерация и кэширование токена`);
    try {
      const token = randomBytes(32).toString('hex');
      const ttl = type === 'confirm' ? 3600 * 1000 : 900 * 1000;
      const cacheKey = `${type}:${token}`;
      await this.cacheManager.set(cacheKey, user, ttl);
      this.logger.log(`Ключ для сохранения:[${cacheKey.substring(0, 20)}...],
      TTL:${ttl}`);
      return token;
    } catch (error) {
      throw new Error(`Ошибка обработки токена:${error}`);
    }
  }
  async validateToken(type: 'confirm' | 'reset', token: string) {
    this.logger.debug(`Проверка токена:${type},${token}`);
    try {
      const cacheKey = `${type}:${token}`;
      const user = await this.cacheManager.get<CreateToken>(cacheKey);
      this.logger.log(`Данные о пользователе ${user} из кэша`);

      if (!user) {
        throw new UnauthorizedException('Недействительный или просроченный токен');
      }
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
