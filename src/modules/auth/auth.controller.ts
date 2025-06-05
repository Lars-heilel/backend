import { AuthService } from './auth.service';
import { ZodValidationPipe } from 'src/common/pipes/zod.validation.pipe';
import { LoginDto, LoginSchema } from './DTO/LoginUserDto';
import { CreateUserDto, CreateUserSchema } from '../users/DTO/createUser.dto';
import { SwaggerDocumentation } from 'src/common/decorators/swagger/swagger.decorator';
import { Body, Controller, Logger, Post, Req, Res, UseGuards, UsePipes } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { JwtUser } from './tokens/types/jwt-req';
import { SafeUser } from '../users/Types/user.types';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    @SwaggerDocumentation({
        operations: { summary: 'New user registration' },
        responses: [
            {
                status: 201,
                description: 'To complete registration, confirm your account via your email',
            },
            {
                status: 400,
                description: 'Validation errors',
            },
            {
                status: 409,
                description: 'User email or name already exists',
            },
        ],
    })
    @UsePipes(new ZodValidationPipe(CreateUserSchema))
    async register(@Body() DTO: CreateUserDto) {
        return await this.authService.register(DTO);
    }
    @Post('login')
    @SwaggerDocumentation({
        operations: { summary: `Authenticates user and returns access/refresh tokens` },
        responses: [],
        body: [{ type: LoginDto }],
    })
    @UseGuards(AuthGuard('local'))
    @UsePipes(new ZodValidationPipe(LoginSchema))
    async login(@Req() req: { user: SafeUser }, @Res({ passthrough: true }) res: Response) {
        return await this.authService.login(req.user, res);
    }

    @Post('logout')
    @SwaggerDocumentation({ operations: { summary: 'logout' }, responses: [] })
    @UseGuards(AuthGuard('jwt'))
    async logout(@Req() req: { user: JwtUser }) {
        return await this.authService.logout(req.user.sub);
    }
    @Post('refresh')
    @SwaggerDocumentation({
        operations: { summary: 'getting a new pair of tokens based on refresh token' },
        responses: [],
    })
    async refreshTokens(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const token = req.cookies['refreshToken'];
        return await this.authService.refresh(token, res);
    }
}
