import { ExpressRequestInterface } from '@app/types/expressRequest.interface';
import { UserService } from '@app/user/user.service';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}
  async use(
    req: ExpressRequestInterface,
    response: Response,
    next: NextFunction,
  ) {
    const { authorization } = req.headers;

    if (!authorization) {
      req.user = null;
      next();
      return;
    }
    const [, token] = authorization.split(' ');
    try {
      const { id } = await this.userService.verifyJWT(token);
      const user = await this.userService.getUserById(id);
      req.user = user;
    } catch (error) {
      req.user = null;
    } finally {
      next();
    }
  }
}
