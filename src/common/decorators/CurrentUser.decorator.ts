import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtUser } from '@src/modules/auth/tokens/types/jwt-req';
export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<{ user: JwtUser }>();
    return request.user.sub;
});
