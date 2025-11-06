import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
<<<<<<< HEAD
import * as bcrypt from 'bcryptjs';
=======
import * as bcrypt from 'bcrypt';
>>>>>>> 91a16942160d47dfadf241795dde0cff6593b312
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(JwtService) private readonly jwt: JwtService,
  ) {}

  async login(dto: { email: string; password: string }) {
    try {
      const email = dto.email.toLowerCase();

      // some PrismaService extend PrismaClient, others wrap it; support both:
      const client: any = (this.prisma as any).user ? (this.prisma as any) : (this.prisma as any).client;

      const user = await client.user.findUnique({ where: { email } });
      if (!user?.passwordHash) throw new UnauthorizedException('Invalid credentials');

      const ok = await bcrypt.compare(dto.password, user.passwordHash);
      if (!ok) throw new UnauthorizedException('Invalid credentials');

      const token = await this.jwt.signAsync(
        { sub: user.id, role: user.role },
        {
          algorithm: 'HS256',
          secret: process.env.JWT_SECRET,
          issuer: 'gateway',
          audience: 'web',
          expiresIn: '15m',
        },
      );
      return { accessToken: token };
    } catch (e: any) {
      console.error('LOGIN ERROR:', e?.message);
      throw e;
    }
  }

  async register(dto: { email: string; password: string; role?: 'admin' | 'user' }) {
    const email = dto.email.toLowerCase();
    const hash = await bcrypt.hash(dto.password, 10);
    const client: any = (this.prisma as any).user ? (this.prisma as any) : (this.prisma as any).client;

    const user = await client.user.upsert({
      where: { email },
      update: {},
      create: { email, passwordHash: hash, role: dto.role ?? 'user' },
    });
    return { id: user.id, email: user.email, role: user.role };
  }
}
