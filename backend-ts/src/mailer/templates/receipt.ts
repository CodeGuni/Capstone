export type ReceiptEmail = {
  orderId: string;
  captureId: string;
  status: string;
  amount: { currency: string; value: string };
  buyer: { email: string; name?: string; payerId?: string };
  createdAtISO: string;
};

export function renderReceiptEmail(receipt: ReceiptEmail, pdfUrl: string) {
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
  </div>`;
}
