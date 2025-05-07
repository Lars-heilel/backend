import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import { userRequset } from 'src/modules/auth/types/userRequest';

@Injectable()
export class RefreshTokenService {
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
    ) {}
    async generateRefreshToken(user: userRequset) {
        const payload = { email: user.email, sub: user.id };
        const refreshToken = this.jwt.sign(payload);
        await this.prisma.token.create({
            data: {
                refreshToken: refreshToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                userId: user.id,
            },
        });
        return refreshToken;
    }
    async validateRefreshToken(token: string) {
        const compareToken = this.jwt.verify(token);
        if (!compareToken) throw new UnauthorizedException('Токен не валиден');
        const storedToken = await this.prisma.token.findFirst({
            where: { refreshToken: token },
        });
        if (!storedToken) throw new UnauthorizedException('Токен не обнаружен');
        return storedToken.userId;
    }
    async revokeRefreshToken(token: string) {
        await this.prisma.token.deleteMany({
            where: { refreshToken: token },
        });
    }
    async findAllToken() {
        const token = await this.prisma.token.findMany();
        return token;
    }
}
