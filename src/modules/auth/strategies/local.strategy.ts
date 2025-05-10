import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    private readonly logger = new Logger(LocalStrategy.name);
    constructor(private usersService: UsersService) {
        super({ usernameField: 'email' });
    }

    async validate(username: string, password: string) {
        this.logger.debug(`Проверка полученых данных от пользователя ${username}`);
        const user = await this.usersService.validateUser(username, password);
        return user;
    }
}
