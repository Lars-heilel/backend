import { Injectable, Logger } from '@nestjs/common';
import { RefreshTokensRepositoryAbsctract } from './refreshTokens.repository.abstract';
import { PrismaService } from '@prisma/prisma.service';
import { Token } from '@prisma/generated/client';

@Injectable()
export class RefresTokenPrismaRepository extends RefreshTokensRepositoryAbsctract {
    private readonly logger = new Logger(RefresTokenPrismaRepository.name);

    constructor(private prisma: PrismaService) {
        super();
    }

    async createRefreshToken(data: { userId: string; refreshToken: string }) {
        this.logger.debug(`Creating refresh token for user: ${data.userId}`);
        return await this.prisma.$transaction(async (tx) => {
            this.logger.verbose(`Deleting existing tokens for user: ${data.userId}`);
            await tx.token.deleteMany({ where: { userId: data.userId } });

            this.logger.verbose(`Creating new token for user: ${data.userId}`);
            const token = await tx.token.create({
                data: {
                    refreshToken: data.refreshToken,
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    userId: data.userId,
                },
            });

            this.logger.log(
                `Refresh token created successfully. User: ${data.userId}, TokenID: ${token.id}`,
            );
            return token;
        });
    }

    async deleteRefreshToken(userId: string) {
        this.logger.debug(`Deleting refresh tokens for user: ${userId}`);
        const result = await this.prisma.token.deleteMany({ where: { userId } });
        this.logger.log(`Deleted ${result.count} refresh tokens for user: ${userId}`);
        return result;
    }

    async findRefreshToken(userId: string): Promise<Token | null> {
        this.logger.debug(`Searching refresh token for user: ${userId}`);
        const token = await this.prisma.token.findFirst({
            where: { userId },
        });

        if (!token) {
            this.logger.verbose(`No refresh token found for user: ${userId}`);
        } else {
            this.logger.verbose(`Refresh token found for user: ${userId}`);
        }
        return token;
    }
}
