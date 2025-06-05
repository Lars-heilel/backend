import { JwtPayload } from 'src/modules/auth/tokens/types/jwt-payload';

export abstract class JwtAbstract {
    abstract signToken(
        payload: object,
        signOptions: { secret: string; expiresIn: string },
    ): Promise<string>;
    abstract verifyToken(token: string, signOptions: { secret: string }): Promise<JwtPayload>;
}
