import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { RolesGuard } from './roles.guard';
import { AdminController } from './admin.controller';

@Module({
  imports: [JwtModule.register({})],
  providers: [AuthService, JwtStrategy, PrismaService, RolesGuard],
  controllers: [AuthController, AdminController],
})
export class AuthModule {}
