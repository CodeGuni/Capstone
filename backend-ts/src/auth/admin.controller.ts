import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { Roles } from "./roles.decorator";
import { RolesGuard } from "./roles.guard";

@ApiTags("admin")
@ApiBearerAuth()
@Controller("admin")
@UseGuards(AuthGuard("jwt"), new RolesGuard(["admin"]))
export class AdminController {
  @Get("ping")
  ping() {
    return { ok: true, area: "admin" };
  }
}
