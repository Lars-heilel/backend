import { JwtPayload } from '@src/modules/auth/tokens/types/jwt-payload';

export interface JwtServiceInterface {
    signToken(payload: object, signOptions: { secret: string; expiresIn: string }): Promise<string>;
    verifyToken(token: string, signOptions: { secret: string }): Promise<JwtPayload>;
}
