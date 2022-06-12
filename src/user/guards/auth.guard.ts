import { UserResponseInterface } from '@app/user/types/userResponse.interface';
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const { user } = context.switchToHttp().getRequest<UserResponseInterface>();
    if (user) {
      return true;
    }
    throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED);
  }
}
