import { Injectable, Inject } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
@Injectable()
export class UsersService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService
  ) {}
  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async countAllUsers(): Promise<number> {
    try {
      const count = await this.prisma.user.count();
      console.log('[UsersService.countAllUsers] Count:', count);
      return count;
    } catch (e: any) {
      console.error('[UsersService.countAllUsers] ERROR:', e?.message);
      console.error('[UsersService.countAllUsers] Stack:', e?.stack);
      return 0;
    }
  }
}
