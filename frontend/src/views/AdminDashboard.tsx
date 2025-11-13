import React, { useEffect, useState } from "react";
import { AuthService } from "../services/AuthService";
import "../styles/ui.css";

const AdminDashboard: React.FC = () => {
  const [claims, setClaims] = useState<any>(null);

  useEffect(() => {
    const c = AuthService.decode();
    setClaims(c);
  }, []);

  const logout = () => {
    AuthService.logout();
    window.location.href = "/admin";
  };

  return (
    <div className="payment-container">
      <div className="payment-card">
        <div className="payment-header">
          <h1>Admin Dashboard</h1>
          <p>Secure area for administrators</p>
        </div>

        <div className="receipt-details">
          <h3>Session</h3>
          <div className="receipt-grid">
            <div className="receipt-item">
              <div className="receipt-label">Authenticated</div>
              <div className="receipt-value">Yes</div>
            </div>
            <div className="receipt-item">
              <div className="receipt-label">JWT (short)</div>
              <div className="receipt-value">
                {AuthService.token.slice(0, 24)}…
              </div>
            </div>
            <div className="receipt-item">
              <div className="receipt-label">Claims</div>
              <div className="receipt-value" style={{ wordBreak: "break-all" }}>
                {claims ? JSON.stringify(claims) : "—"}
              </div>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <a className="download-button" href="/pay">
            Go to Payments
          </a>
          <button className="retry-button" onClick={logout}>
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
