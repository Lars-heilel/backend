import { SafeUser } from 'src/modules/users/Types/user.types';

export type TokenType = 'confirm' | 'reset';

export abstract class MailTokenManagerAbstract {
    abstract generateAndCacheTokens(user: SafeUser, type: TokenType): Promise<string>;
    abstract validateToken(type: TokenType, token: string);
    abstract revokeToken(type: TokenType, token: string): Promise<void>;
}
