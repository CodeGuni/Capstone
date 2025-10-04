import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./jwt.strategy";
import { PrismaService } from "../prisma/prisma.service";
import { AdminController } from "./admin.controller";

@Module({
  imports: [JwtModule.register({})],
  providers: [AuthService, JwtStrategy, PrismaService],
  controllers: [AuthController, AdminController],
})
export class AuthModule {}
