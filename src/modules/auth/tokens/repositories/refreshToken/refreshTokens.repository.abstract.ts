import { Token } from 'prisma/generated';

export abstract class RefreshTokensRepositoryAbsctract {
    abstract createRefreshToken(data: {
        userId: string;
        refreshToken: string;
    }): Promise<Token | null>;
    abstract findRefreshToken(userId: string): Promise<Token | null>;
    abstract deleteRefreshToken(userId: string);
}
