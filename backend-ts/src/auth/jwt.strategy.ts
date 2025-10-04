import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_PUBLIC,
      algorithms: ["RS256"],
      issuer: "gateway",
      audience: "web",
    });
  }
  validate(p: any) {
    return { userId: p.sub, role: p.role };
  }
}
