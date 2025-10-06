import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async register(dto: {
    email: string;
    password: string;
    role?: "admin" | "user";
  }) {
    const hash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash: hash,
        role: dto.role ?? "user",
      },
    });
    return { id: user.id, email: user.email, role: user.role };
  }

  async login(dto: { email: string; password: string }) {
    const u = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (!u || !(await bcrypt.compare(dto.password, u.passwordHash))) {
      throw new UnauthorizedException("Invalid credentials");
    }
    const accessToken = await this.jwt.signAsync(
      { sub: u.id, role: u.role },
      {
        algorithm: "RS256",
        issuer: "gateway",
        audience: "web",
        expiresIn: "15m",
        privateKey: process.env.JWT_PRIVATE,
      }
    );
    return { accessToken };
  }
}
