import {
  CanActivate, ExecutionContext, Injectable,
  UnauthorizedException, ForbiddenException, Inject
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(@Inject(Reflector) private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Array<'admin'|'user'>>(ROLES_KEY, [
      ctx.getHandler(), ctx.getClass(),
    ]) || [];

    // No roles required → allow
    if (required.length === 0) return true;

    const req = ctx.switchToHttp().getRequest();
    const user = req.user; // set by JwtStrategy
    if (!user) {
      throw new UnauthorizedException('No user on request (JWT missing?)');
    }

    const ok = required.includes(user.role);
    if (!ok) {
      throw new ForbiddenException('Insufficient role');
    }
    return true;
  }
}
