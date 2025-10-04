import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private required: string[]) {}
  canActivate(ctx: ExecutionContext) {
    const user = ctx.switchToHttp().getRequest().user;
    return !!user && this.required.includes(user.role);
  }
}
