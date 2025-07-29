import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    private readonly logger = new Logger(LocalStrategy.name);

    constructor(private usersService: UsersService) {
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
