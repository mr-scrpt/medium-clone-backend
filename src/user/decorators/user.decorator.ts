import { UserResponseInterface } from '@app/user/types/userResponse.interface';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const { user } = ctx.switchToHttp().getRequest<UserResponseInterface>();

    if (!user) {
      return null;
    }

    if (data) {
      return user[data];
    }

    return user;
  },
);
