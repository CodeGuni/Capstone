export class ApiService {
  private baseUrl: string;
  private token: string;

  // backend API by default
  constructor(
    baseUrl: string = (import.meta as any).env?.VITE_API_URL
      ? `${(import.meta as any).env.VITE_API_URL.replace(/\/$/, "")}/api`
      : "http://localhost:3000/api"
  ) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem("jwt_token") || "demo_token";
  }

  // create-order
  async createOrder(value: string, currency: string, description: string) {
    return this.request("/paypal/create-order", {
      method: "POST",
      body: JSON.stringify({ value, currency, description }),
    });
  }

  // GET token
  async confirmReturn(orderId: string, payerId: string) {
    return this.request(
      `/paypal/return?token=${encodeURIComponent(
        orderId
      )}&PayerID=${encodeURIComponent(payerId)}`
    );
  }

  // capture-order
  async captureOrder(orderId: string) {
    return this.request("/paypal/capture-order", {
      method: "POST",
      body: JSON.stringify({ orderId }),
    });
  }

  // POST presign
  async presignFile(filename: string, contentType: string) {
    return this.request("/files/presign", {
      method: "POST",
      body: JSON.stringify({ filename, contentType }),
    });
  }

  // PUT to Azure blob
  async uploadToBlob(url: string, blob: Blob): Promise<void> {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "x-ms-blob-type": "BlockBlob",
        "Content-Type": "application/pdf",
      },
      body: blob,
    });
    if (!response.ok) throw new Error(`Upload failed: ${response.status}`);
  }

  // email the receipt via backend
  async emailReceipt(pdfUrl: string, receipt: any) {
    return this.request("/paypal/email-receipt", {
      method: "POST",
      body: JSON.stringify({ pdfUrl, receipt }),
    });
  }

  // Core request helper
  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(
        `API Error: ${response.status} ${response.statusText}${
          text ? ` - ${text}` : ""
        }`
      );
    }
    try {
      return await response.json();
    } catch {
      return null as any;
    }
  }
}
