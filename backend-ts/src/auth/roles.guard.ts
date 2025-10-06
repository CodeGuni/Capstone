import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "./roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(ctx: ExecutionContext): boolean {
    const requiredRoles =
      this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
        ctx.getHandler(),
        ctx.getClass(),
      ]) || [];
    const req = ctx.switchToHttp().getRequest();
    const user = req.user;
    if (!requiredRoles.length) return !!user;
    return !!user && requiredRoles.includes(user.role);
  }
}
