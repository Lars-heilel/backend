import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';

import { USER_SERVICE } from '@src/core/constants/di-token';
import { UserServiceInterface } from '@src/modules/users/interface/userServiceInterface';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    private readonly logger = new Logger(LocalStrategy.name);

    constructor(@Inject(USER_SERVICE) private usersService: UserServiceInterface) {
        super({ usernameField: 'email' });
    }

    async validate(email: string, password: string) {
        this.logger.debug(`Authentication attempt: ${email}`);

        const user = await this.usersService.validateUser(email, password);
        if (!user) {
            this.logger.warn(`Authentication failed: ${email}`);
            throw new UnauthorizedException();
        }
        this.logger.log(`User authenticated: ${email}`);
        return user;
    }
}
