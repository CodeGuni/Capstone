export type PaymentStep =
  | "idle"
  | "creatingOrder"
  | "redirecting"
  | "capturing"
  | "pdfGenerating"
  | "uploading"
  | "emailing"
  | "success"
  | "error";

export interface Receipt {
  orderId: string;
  captureId: string;
  status: string;
  amount: { value: string; currency: string };
  buyer: { email: string; payerId: string; name?: string };
  description: string;
  createdAtISO: string;
}

export interface PaymentState {
  step: PaymentStep;
  error: string;
  receipt: Receipt | null;
  pdfUrl: string;
  userEmail: string;
  isResendingEmail: boolean;
}

export class PaymentModel {
  private state: PaymentState;
  private listeners: Array<(state: PaymentState) => void> = [];

  constructor() {
    this.state = {
      step: "idle",
      error: "",
      receipt: null,
      pdfUrl: "",
      userEmail: "Guni@info.ca",
      isResendingEmail: false,
    };
  }

  getState(): PaymentState {
    return { ...this.state };
  }

  setState(updates: Partial<PaymentState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  subscribe(listener: (state: PaymentState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.state));
  }

  reset(): void {
    this.state = {
      step: "idle",
      error: "",
      receipt: null,
      pdfUrl: "",
      userEmail: this.state.userEmail,
      isResendingEmail: false,
    };
    this.notifyListeners();
  }
}
