import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";

@ApiTags("admin")
@ApiBearerAuth()
@Controller("admin")
@UseGuards(AuthGuard("jwt"), RolesGuard)
export class AdminController {
  @Get("ping")
  @Roles("admin")
  ping() {
    return { ok: true, role: "admin" };
  }
}
