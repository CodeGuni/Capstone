import { Receipt } from "../models/PaymentModel";

export class PDFService {
  async generateReceipt(receipt: Receipt): Promise<Blob> {
    const { jsPDF } = await import("jspdf");

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(24);
    doc.text("AIFS Receipt", pageWidth / 2, 30, { align: "center" });

    // Divider
    doc.setLineWidth(0.5);
    doc.line(20, 40, pageWidth - 20, 40);

    // Receipt details
    doc.setFontSize(12);
    let yPos = 55;
    const lineHeight = 10;

    const fields = [
      { label: "Order ID:", value: receipt.orderId },
      { label: "Capture ID:", value: receipt.captureId },
      { label: "Status:", value: receipt.status },
      {
        label: "Amount:",
        value: `${receipt.amount.currency} $${receipt.amount.value}`,
      },
      { label: "Description:", value: receipt.description },
      { label: "Buyer Email:", value: receipt.buyer.email },
      { label: "Payer ID:", value: receipt.buyer.payerId },
      {
        label: "Date/Time:",
        value: new Date(receipt.createdAtISO).toLocaleString(),
      },
    ];

    fields.forEach((field) => {
      doc.text(field.label, 20, yPos);
      doc.text(field.value, 65, yPos);
      yPos += lineHeight;
    });

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(
      "This is a sandbox receipt for demonstration only.",
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 20,
      { align: "center" }
    );

    return doc.output("blob");
  }

  generateEmailHtml(receipt: Receipt, pdfUrl: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Thank you for your purchase${
          receipt.buyer.name ? `, ${receipt.buyer.name}` : ""
        }!</h2>
        <p>Your payment has been processed successfully.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background-color: #f5f5f5;">
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Order ID</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${
              receipt.orderId
            }</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Amount</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${
              receipt.amount.currency
            } $${receipt.amount.value}</td>
          </tr>
          <tr style="background-color: #f5f5f5;">
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Status</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${
              receipt.status
            }</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Date</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${new Date(
              receipt.createdAtISO
            ).toLocaleString()}</td>
          </tr>
        </table>
        
        <div style="margin: 30px 0; text-align: center;">
          <a href="${pdfUrl}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Download Your Receipt
          </a>
        </div>
        
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          This is a sandbox receipt for demonstration only.
        </p>
      </div>
    `;
  }
}
