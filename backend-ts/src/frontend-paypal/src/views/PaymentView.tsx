import React, { useState, useEffect } from "react";
import {
  PaymentModel,
  PaymentState,
  PaymentStep,
} from "../models/PaymentModel";
import { PaymentController } from "../controllers/PaymentController";
import "../styles/payment.css";

const PaymentView: React.FC = () => {
  const [model] = useState(() => new PaymentModel());
  const [controller] = useState(() => new PaymentController(model));
  const [state, setState] = useState<PaymentState>(model.getState());

  // sync with model
  useEffect(() => {
    const unsubscribe = model.subscribe(setState);
    return unsubscribe;
  }, [model]);

  // handle PayPal return
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const payerId = params.get("PayerID");
    if (token && payerId && state.step === "idle") {
      controller.handleReturn(token, payerId);
    }
  }, []);

  // detect cancel flow
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("cancel") === "1") {
      model.setState({
        step: "error",
        error: "Payment was cancelled before completion.",
      });
      const clean = window.location.origin + window.location.pathname;
      window.history.replaceState({}, "", clean);
    }
  }, []);

  // avoid re-trigger capture on refresh
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("token") || params.has("PayerID")) {
      const clean = window.location.origin + window.location.pathname;
      window.history.replaceState({}, "", clean);
    }
  }, []);

  // open PDF
  useEffect(() => {
    if (state.step === "success" && state.pdfUrl) {
      window.open(state.pdfUrl, "_blank", "noopener");
    }
  }, [state.step, state.pdfUrl]);

  const renderStepIndicator = (targetStep: PaymentStep, label: string) => {
    const steps: PaymentStep[] = [
      "idle",
      "creatingOrder",
      "redirecting",
      "capturing",
      "pdfGenerating",
      "uploading",
      "emailing",
      "success",
    ];
    const currentIndex = steps.indexOf(state.step);
    const targetIndex = steps.indexOf(targetStep);

    let statusClass = "step-pending";
    if (state.step === "error") {
      statusClass = "step-error";
    } else if (currentIndex > targetIndex) {
      statusClass = "step-completed";
    } else if (currentIndex === targetIndex) {
      statusClass = "step-active";
    }

    return (
      <div className={`step-indicator ${statusClass}`}>
        <div className="step-icon"></div>
        <span className="step-label">{label}</span>
      </div>
    );
  };

  if (state.step === "idle") {
    return (
      <div className="payment-container">
        <div className="payment-card">
          <div className="payment-header">
            <h1>AIFS Payment</h1>
            <p>Secure payment processing with PayPal Sandbox</p>
          </div>

          <div className="plan-card">
            <div className="plan-content">
              <div className="plan-info">
                <h2>AIFS Premium</h2>
                <p>Full access to all premium features</p>
              </div>
              <div className="plan-price">
                <div className="price-amount">$9.99</div>
                <div className="price-currency">CAD</div>
              </div>
            </div>
          </div>

          <div className="buyer-info">
            <h3>Buyer Information</h3>
            <div className="buyer-email">
              <span className="email-icon">✉</span>
              <span>{state.userEmail}</span>
            </div>
          </div>

          <button
            className="pay-button"
            onClick={() => controller.initiatePayment()}
          >
            Pay with PayPal (Sandbox)
          </button>
        </div>
      </div>
    );
  }

  if (
    [
      "creatingOrder",
      "redirecting",
      "capturing",
      "pdfGenerating",
      "uploading",
      "emailing",
    ].includes(state.step)
  ) {
    return (
      <div className="payment-container">
        <div className="payment-card">
          <h2>Processing Payment...</h2>
          <div className="steps-container">
            {renderStepIndicator("creatingOrder", "Creating order")}
            {renderStepIndicator("redirecting", "Redirecting to PayPal")}
            {renderStepIndicator("capturing", "Capturing payment")}
            {renderStepIndicator("pdfGenerating", "Generating receipt PDF")}
            {renderStepIndicator("uploading", "Uploading to Azure")}
            {renderStepIndicator("emailing", "Sending email")}
          </div>
        </div>
      </div>
    );
  }

  if (state.step === "error") {
    return (
      <div className="payment-container">
        <div className="payment-card">
          <div className="error-state">
            <div className="error-icon">⚠</div>
            <h2>Payment Failed</h2>
            <p className="error-message">{state.error}</p>
            <button className="retry-button" onClick={() => controller.retry()}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (state.step === "success" && state.receipt) {
    return (
      <div className="payment-container">
        <div className="payment-card">
          <div className="success-header">
            <div className="success-icon">✓</div>
            <h2>Payment Successful!</h2>
            <p>Your receipt has been generated and emailed to you.</p>
          </div>

          <div className="receipt-details">
            <h3>Receipt Details</h3>
            <div className="receipt-grid">
              <div className="receipt-item">
                <div className="receipt-label">Order ID</div>
                <div className="receipt-value">{state.receipt.orderId}</div>
              </div>
              <div className="receipt-item">
                <div className="receipt-label">Capture ID</div>
                <div className="receipt-value">{state.receipt.captureId}</div>
              </div>
              <div className="receipt-item">
                <div className="receipt-label">Amount</div>
                <div className="receipt-value">
                  {state.receipt.amount.currency} ${state.receipt.amount.value}
                </div>
              </div>
              <div className="receipt-item">
                <div className="receipt-label">Status</div>
                <div className="receipt-value status-completed">
                  {state.receipt.status}
                </div>
              </div>
              <div className="receipt-item">
                <div className="receipt-label">Buyer Email</div>
                <div className="receipt-value">{state.receipt.buyer.email}</div>
              </div>
              <div className="receipt-item">
                <div className="receipt-label">Date/Time</div>
                <div className="receipt-value">
                  {new Date(state.receipt.createdAtISO).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <div className="action-buttons">
            <a
              href={state.pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="download-button"
            >
              Download Receipt
            </a>

            <button
              className="resend-button"
              onClick={() => controller.resendEmail()}
              disabled={state.isResendingEmail}
            >
              {state.isResendingEmail ? "⏳" : "✉"} Resend Email
            </button>

            <button
              className="retry-button"
              onClick={() => controller.reset?.()}
            >
              New Payment
            </button>
          </div>
        </div>

        <div className="demo-notice">
          <p> This is a sandbox environment for capstone purposes only</p>
        </div>
      </div>
    );
  }

  return null;
};

export default PaymentView;
