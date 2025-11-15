import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { RolesGuard } from './roles.guard';
import { AdminController } from './admin.controller';
import { UsersModule } from '../users/users.module';
import { JobsModule } from '../jobs/jobs.module';
import { PaypalModule } from '../paypal/paypal.module';

@Module({
  imports: [
    JwtModule.register({}),
    UsersModule,
    JobsModule,
    PaypalModule,
  ],
  providers: [AuthService, JwtStrategy, RolesGuard],
  controllers: [AuthController, AdminController],
})
export class AuthModule {}
