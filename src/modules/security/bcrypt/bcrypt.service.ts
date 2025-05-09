import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Env } from 'src/core/config/envConfig';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptService {
  private readonly logger = new Logger(BcryptService.name);
  constructor(private env: ConfigService<Env>) {}

  async hash(data: string) {
    const saltRounds = this.env.get('SALT_ROUNDS');
    this.logger.debug('Начало хэширования данных');
    try {
      const hash = bcrypt.hash(data, saltRounds);
      this.logger.log('Данные успешно хэшированы');
      return hash;
    } catch (error) {
      this.logger.error(`Ошибка хэширования: ${error.message}`, error.stack);
      throw new Error('Ошибка обработки');
    }
  }
  async compare(data: string, hashedData: string) {
    this.logger.debug(`Сравнение данных с хэшем [${hashedData.substring(0, 6)}...]`);
    try {
      const result = bcrypt.compare(data, hashedData);
      this.logger.log('Данные успешно проверены');
      return result;
    } catch (error) {
      this.logger.error(`Ошибка сравнения: ${error.message}`, error.stack);
      throw new Error('Ошибка проверки ');
    }
  }
}
