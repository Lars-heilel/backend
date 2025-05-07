import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private usersService: UsersService) {
        super({ usernameField: 'email' });
    }

    async validate(username: string, password: string) {
        const user = await this.usersService.validateUser(username, password);
        return user;
    }
}
