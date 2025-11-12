import { Injectable } from "@nestjs/common";
import nodemailer from "nodemailer";

@Injectable()
export class EmailService {
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST!,
    port: +(process.env.SMTP_PORT || 587),
    secure: +(process.env.SMTP_PORT || 587) === 465,
    auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
  });

  async verify() {
    return this.transporter.verify();
  }

  async send(to: string, subject: string, html: string) {
    const from = process.env.EMAIL_FROM || "AIFS <no-reply@guni.ca>";
    const info = await this.transporter.sendMail({ from, to, subject, html });
    return info.messageId;
  }
}
