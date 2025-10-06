import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post("register")
  register(
    @Body() dto: { email: string; password: string; role?: "admin" | "user" }
  ) {
    return this.auth.register(dto);
  }

  @Post("login")
  login(@Body() dto: { email: string; password: string }) {
    return this.auth.login(dto);
  }
}
