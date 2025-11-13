import React, { useState } from "react";
import { AuthService } from "../services/AuthService";
import "../styles/ui.css";

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await AuthService.login(email.trim(), pw);
      // go to dashboard
      window.location.href = "/dashboard";
    } catch (e: any) {
      setErr(e?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-container">
      <div className="payment-card" style={{ maxWidth: 480 }}>
        <div className="payment-header">
          <h1>Admin Login</h1>
          <p>Sign in with your admin credentials</p>
        </div>

        <form onSubmit={onSubmit} className="form">
          <label className="label">
            Email
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
            />
          </label>

          <label className="label" style={{ marginTop: 12 }}>
            Password
            <input
              type="password"
              className="input"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="••••••••"
              required
            />
          </label>

          {err && (
            <p className="error-message" style={{ marginTop: 12 }}>
              {err}
            </p>
          )}

          <button
            className="pay-button"
            style={{ marginTop: 16 }}
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
