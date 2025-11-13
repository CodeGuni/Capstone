import { Module } from "@nestjs/common";
import { PaypalController } from "./paypal.controller";
import { PaypalService } from "./paypal.service";
import { EmailService } from "../mailer/email.service";

@Module({
  controllers: [PaypalController],
  providers: [PaypalService, EmailService],
  exports: [PaypalService],
})
export class PaypalModule {}
