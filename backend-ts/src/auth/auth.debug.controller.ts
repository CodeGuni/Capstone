import { Body, Controller, HttpCode, HttpStatus, Inject, Post } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Controller('auth')
export class AuthDebugController {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(JwtService) private readonly jwt: JwtService,
  ) {}

  @Post('debug-login')
  @HttpCode(HttpStatus.OK)
  async debugLogin(@Body() dto: { email: string; password: string }) {
    const email = (dto?.email || '').toLowerCase();
    const password = dto?.password || '';

    try {
      
      const client: any = (this.prisma as any).user ? (this.prisma as any) : (this.prisma as any).client;

      const user = await client.user.findUnique({ where: { email } });
      const hasHash = !!user?.passwordHash;
      const bcryptOk = hasHash ? await bcrypt.compare(password, user!.passwordHash) : false;

      let tokenPreview = '';
      if (bcryptOk) {
        const token = await this.jwt.signAsync(
          { sub: user!.id, role: user!.role },
          {
            algorithm: 'HS256',
            secret: process.env.JWT_SECRET,
            issuer: 'gateway',
            audience: 'web',
            expiresIn: '15m',
          },
        );
        tokenPreview = token.slice(0, 25);
      }

      return {
        email,
        userFound: !!user,
        role: user?.role ?? null,
        hasHash,
        bcryptOk,
        hasJwtSecret: !!process.env.JWT_SECRET,
        jwtSecretLen: (process.env.JWT_SECRET || '').length,
        tokenPreview,
      };
    } catch (e: any) {
      return { error: e?.message || String(e) };
    }
  }
}
