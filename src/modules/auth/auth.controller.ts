import {
    Body,
    Controller,
    Get,
    Post,
    Req,
    UseGuards,
    UsePipes,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from 'src/common/pipes/zod.validation.pipe';
import { RegisterDto, RegisterSchema } from './DTO/RegisterUserDto';
import { LoginSchema } from './DTO/LoginUserDto';
import { LocalAuthGuard } from 'src/common/guards/local-auth.guard';
import { userRequset } from './types/userRequest';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    @UsePipes(new ZodValidationPipe(RegisterSchema))
    async register(@Body() DTO: RegisterDto) {
        return await this.authService.register(DTO);
    }

    @Post('login')
    @UsePipes(new ZodValidationPipe(LoginSchema))
    @UseGuards(LocalAuthGuard)
    async login(@Req() req: { user: userRequset }) {
        return await this.authService.login(req.user);
    }
    @Post('logout')
    async logout() {}

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Req() req) {
        return req.user;
    }
}
