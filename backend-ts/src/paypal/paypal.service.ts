import { Injectable, Inject } from "@nestjs/common";
import axios from "axios";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class PaypalService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}
  private readonly base = process.env.BASE_URL ?? "http://localhost:3000";
  private readonly env = (process.env.PAYPAL_ENV ?? "sandbox").toLowerCase();
  private get apiRoot() {
    return this.env === "live"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";
  }

  ping() {
    return {
      env: this.env,
      hasId: !!process.env.PAYPAL_CLIENT_ID,
      hasSecret: !!process.env.PAYPAL_CLIENT_SECRET,
      base: this.base,
      diOk: true,
    };
  }

  async getAccessToken(): Promise<string> {
    const id = process.env.PAYPAL_CLIENT_ID!;
    const sec = process.env.PAYPAL_CLIENT_SECRET!;
    const pair = Buffer.from(`${id}:${sec}`).toString("base64");

    const res = await axios.post(
      `${this.apiRoot}/v1/oauth2/token`,
      "grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${pair}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return res.data.access_token as string;
  }

  async createOrder(
    value: string,
    currency = "CAD",
    description = "AIFS Premium"
  ) {
    const access = await this.getAccessToken();
    const body = {
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: "default",
          description,
          amount: { currency_code: currency, value },
        },
      ],
      application_context: {
        brand_name: "AIFS",
        user_action: "PAY_NOW",
        return_url: `${this.base}/api/paypal/return`,
        cancel_url: `${this.base}/api/paypal/cancel`,
      },
    };

    const r = await axios.post(`${this.apiRoot}/v2/checkout/orders`, body, {
      headers: {
        Authorization: `Bearer ${access}`,
        "Content-Type": "application/json",
      },
    });

    const id = r.data.id as string;
    const approvalLink =
      (r.data.links as any[]).find((l) => l.rel === "approve")?.href ?? null;

    return { id, status: r.data.status, approvalUrl: approvalLink };
  }

  async captureOrder(orderId: string) {
    const access = await this.getAccessToken();
    const r = await axios.post(
      `${this.apiRoot}/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${access}`,
          "Content-Type": "application/json",
        },
      }
    );
    return r.data;
  }

  async getTotalRevenue(): Promise<number> {
    try {
      const payments = await this.prisma.payment.findMany({
        where: {
          status: 'COMPLETED',
        },
        select: {
          amount: true,
        },
      });

      const total = payments.reduce((sum, payment) => {
        return sum + Number(payment.amount);
      }, 0);

      return total;
    } catch (e: any) {
      console.error('[PaypalService.getTotalRevenue] ERROR:', e?.message);
      // return 0 if not there
      if (e?.message?.includes('payment') || e?.message?.includes('model')) {
        console.warn('Payment model may not exist in database yet. Run: npm run prisma:gen && npm run prisma:push');
        return 0;
      }
      throw e;
    }
  }
}
