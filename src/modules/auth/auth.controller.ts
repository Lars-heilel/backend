import { AuthService } from './auth.service';
import { ZodValidationPipe } from 'nestjs-zod';
import { LoginDto, LoginSchema } from './DTO/LoginUserDto';
import { CreateUserDto, CreateUserSchema } from '../users/DTO/createUser.dto';
import {
    Body,
    Controller,
    Post,
    Req,
    Res,
    UseGuards,
    UsePipes,
    UnauthorizedException,
    HttpStatus,
    ForbiddenException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { JwtUser } from './tokens/types/jwt-req';
import { SafeUser } from '../users/Types/user.types';
import { RefreshTokenSchema } from './DTO/RefreshTokenDto';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBody,
    ApiBearerAuth,
    ApiCookieAuth,
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    @ApiBody({ type: CreateUserDto, description: 'User registration data' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'User successfully registered.' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' })
    @UsePipes(new ZodValidationPipe(CreateUserSchema))
    async register(@Body() DTO: CreateUserDto): Promise<{ message: string }> {
        return await this.authService.register(DTO);
    }

    @Post('login')
    @ApiOperation({ summary: 'Log in a user and get tokens' })
    @ApiBody({ type: LoginDto, description: 'User login credentials' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User successfully logged in, tokens in response/cookies.',
        schema: {
            properties: {
                accessToken: { type: 'string', description: 'JWT Access Token' },
            },
        },
    })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid credentials.' })
    @UseGuards(AuthGuard('local'))
    @UsePipes(new ZodValidationPipe(LoginSchema))
    async login(
        @Req() req: { user: SafeUser },
        @Res({ passthrough: true }) res: Response,
    ): Promise<{ token: string; user: SafeUser }> {
        return await this.authService.login(req.user, res);
    }

    @Post('logout')
    @ApiOperation({ summary: 'Log out a user' })
    @ApiBearerAuth('access-token')
    @ApiResponse({ status: HttpStatus.OK, description: 'User successfully logged out.' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized access.' })
    @UseGuards(AuthGuard('jwt'))
    async logout(@Req() req: { user: JwtUser }): Promise<{ message: string }> {
        return await this.authService.logout(req.user.sub);
    }

    @Post('refresh')
    @ApiOperation({ summary: 'Refresh access token using refresh token' })
    @ApiCookieAuth('refreshToken')
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Access token successfully refreshed.',
        schema: {
            properties: {
                accessToken: { type: 'string', description: 'New JWT Access Token' },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Invalid or expired refresh token.',
    })
    async refreshTokens(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ): Promise<string> {
        const token: unknown = req.cookies['refreshToken'];

        const parsedToken = await RefreshTokenSchema.safeParseAsync(token);
        if (!parsedToken.success) {
            throw new ForbiddenException('Invalid refresh token format');
        }
        return await this.authService.refresh(parsedToken.data, res);
    }
}
