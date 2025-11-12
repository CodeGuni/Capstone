import { PaymentModel, Receipt } from "../models/PaymentModel";
import { ApiService } from "../services/ApiService";
import { PDFService } from "../services/PDFService";

export class PaymentController {
  private model: PaymentModel;
  private apiService: ApiService;
  private pdfService: PDFService;

  constructor(model: PaymentModel) {
    this.model = model;
    this.apiService = new ApiService();
    this.pdfService = new PDFService();
  }

  async initiatePayment(): Promise<void> {
    try {
      this.model.setState({ step: "creatingOrder", error: "" });

      const orderData = await this.apiService.createOrder(
        "9.99",
        "CAD",
        "AIFS Premium"
      );
      if (!orderData?.approvalUrl)
        throw new Error("Missing approval URL from server");

      this.model.setState({ step: "redirecting" });
      setTimeout(() => {
        window.location.href = orderData.approvalUrl;
      }, 500);
    } catch (err: any) {
      this.model.setState({
        step: "error",
        error: err?.message || "Failed to create order",
      });
    }
  }

  async handleReturn(token: string, payerId: string): Promise<void> {
    try {
      this.model.setState({ step: "capturing", error: "" });

      // Capture the order
      const captureData = await this.apiService.captureOrder(token);
      if (!captureData) throw new Error("Empty capture response from server");
      if (captureData.status !== "COMPLETED") {
        throw new Error(
          `Payment not completed (status: ${captureData.status || "unknown"})`
        );
      }

      // Build and store the receipt in state
      const receipt = this.buildReceipt(token, captureData);
      this.model.setState({ receipt });

      // Generate the PDF
      this.model.setState({ step: "pdfGenerating" });
      const pdfBlob = await this.pdfService.generateReceipt(receipt);

      // Upload PDF to Azure
      this.model.setState({ step: "uploading" });
      const presignData = await this.apiService.presignFile(
        `receipts/${receipt.orderId}.pdf`,
        "application/pdf"
      );
      if (!presignData?.url) throw new Error("Failed to get upload URL");

      await this.apiService.uploadToBlob(presignData.url, pdfBlob);

      const readUrl =
        (presignData.publicUrl as string) ||
        (presignData.readUrl as string) ||
        (presignData.url as string);

      this.model.setState({ pdfUrl: readUrl });

      // Send the email
      this.model.setState({ step: "emailing" });
      try {
        await this.apiService.emailReceipt(readUrl, receipt);
      } catch (e: any) {
        console.warn("Email failed, showing success anyway:", e?.message || e);
      }
      this.model.setState({ step: "success", error: "" });
    } catch (err: any) {
      this.model.setState({
        step: "error",
        error: err?.message || "An error occurred while processing payment",
      });
    }
  }

  async resendEmail(): Promise<void> {
    const state = this.model.getState();
    if (!state.receipt || !state.pdfUrl) return;

    this.model.setState({ isResendingEmail: true });
    try {
      await this.apiService.emailReceipt(state.pdfUrl, state.receipt);
      alert("Email sent successfully!");
    } catch (err: any) {
      alert("Failed to send email: " + (err?.message || "Unknown error"));
    } finally {
      this.model.setState({ isResendingEmail: false });
    }
  }

  retry(): void {
    this.reset();
  }

  // New Payment button reset 
  reset(): void {
    this.model.reset();
    const clean = window.location.origin + window.location.pathname;
    window.history.replaceState({}, "", clean);
  }

  // ------------- helpers -------------
  private buildReceipt(orderId: string, captureData: any): Receipt {
    const state = this.model.getState();
    const capture =
      captureData?.purchase_units?.[0]?.payments?.captures?.[0] || {};
    const amount = capture.amount || {};

    return {
      orderId,
      captureId: capture.id || "N/A",
      status: captureData.status || "COMPLETED",
      amount: {
        value: amount.value || "9.99",
        currency: amount.currency_code || "CAD",
      },
      buyer: {
        email: captureData?.payer?.email_address || state.userEmail,
        payerId: captureData?.payer?.payer_id || "N/A",
        name:
          captureData?.payer?.name?.given_name ||
          captureData?.payer?.name?.surname
            ? `${captureData.payer.name.given_name || ""} ${
                captureData.payer.name.surname || ""
              }`.trim()
            : undefined,
      },
      description: "AIFS Premium",
      createdAtISO: new Date().toISOString(),
    };
  }
}
