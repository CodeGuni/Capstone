import { Controller, Get, Post, Body, Query, Inject } from "@nestjs/common";
import { PaypalService } from "./paypal.service";

@Controller("paypal")
export class PaypalController {
  
  constructor(@Inject(PaypalService) private readonly paypal: PaypalService) {}

  @Get("ping")
  ping() {
    if (!this.paypal) {
      return {
        env: process.env.PAYPAL_ENV ?? "sandbox",
        hasId: !!process.env.PAYPAL_CLIENT_ID,
        hasSecret: !!process.env.PAYPAL_CLIENT_SECRET,
        base: process.env.BASE_URL ?? "http://localhost:3000",
        diOk: false,
      };
    }
    return this.paypal.ping();
  }

  @Get("debug-token")
  async debugToken() {
    const tok = await this.paypal.getAccessToken();
    return { ok: true, tokenSample: tok.slice(0, 24) };
  }

  @Post("create-order")
  create(
    @Body() body: { value: string; currency?: string; description?: string }
  ) {
    const { value, currency = "CAD", description = "AIFS Premium" } = body;
    return this.paypal.createOrder(value, currency, description);
  }

  @Post("capture-order")
  capture(@Body() body: { orderId: string }) {
    return this.paypal.captureOrder(body.orderId);
  }

  @Get("return")
  returned(@Query("token") token?: string, @Query("PayerID") payer?: string) {
    return { ok: true, token, payer };
  }

  @Get("cancel")
  canceled() {
    return { ok: true, canceled: true };
  }
}
