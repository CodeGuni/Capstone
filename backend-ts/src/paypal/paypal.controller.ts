import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Inject,
  BadRequestException,
  Res,
} from "@nestjs/common";
import type { FastifyReply } from "fastify";
import { PaypalService } from "./paypal.service";
import { EmailService } from "../mailer/email.service";
import { renderReceiptEmail } from "../mailer/templates/receipt";

type EmailReceiptBody = {
  pdfUrl: string;
  receipt: {
    orderId: string;
    captureId: string;
    status: string;
    amount: { currency: string; value: string };
    buyer: { email: string; name?: string; payerId?: string };
    createdAtISO: string;
    description?: string;
  };
};

@Controller("paypal")
export class PaypalController {
  constructor(
    @Inject(PaypalService) private readonly paypal: PaypalService,
    private readonly emailSvc: EmailService
  ) {}

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

  // PayPal returns after approval 
  @Get("return")
  async returned(
    @Query("token") token?: string,
    @Query("PayerID") payer?: string,
    @Res() res?: FastifyReply
  ) {
    if (!token || !payer)
      throw new BadRequestException("Missing token or PayerID");

    const frontendBase =
      process.env.PAYPAL_RETURN_FRONTEND_URL || "http://localhost:5173";

    const url =
      `${frontendBase}` +
      `?token=${encodeURIComponent(token)}` +
      `&PayerID=${encodeURIComponent(payer)}`;

    return res!.redirect(302, url);
  }

  // back to the frontend with a cancel flag
  @Get("cancel")
  async canceled(@Res() res: FastifyReply) {
    const frontendBase =
      process.env.PAYPAL_RETURN_FRONTEND_URL || "http://localhost:5173";
    const url = `${frontendBase}?cancel=1`;
    return res.redirect(302, url);
  }

  // send the receipt email (after upload)
  @Post("email-receipt")
  async emailReceipt(@Body() body: EmailReceiptBody) {
    const { pdfUrl, receipt } = body || {};
    if (!pdfUrl || !receipt?.buyer?.email) {
      throw new BadRequestException("Missing pdfUrl or buyer email");
    }

    try {
      // checks host/port/auth and TLS up front 
      await this.emailSvc.verify?.();

      const html = renderReceiptEmail(
        {
          orderId: receipt.orderId,
          captureId: receipt.captureId,
          status: receipt.status,
          amount: receipt.amount,
          buyer: receipt.buyer,
          createdAtISO: receipt.createdAtISO,
        },
        pdfUrl
      );

      const id = await this.emailSvc.send(
        receipt.buyer.email,
        "Your AIFS Receipt",
        html
      );

      return { ok: true, messageId: id };
    } catch (e: any) {
      const msg = e?.response?.toString?.() || e?.message || "SMTP send failed";
      throw new BadRequestException(`Email send failed: ${msg}`);
    }
  }
}
