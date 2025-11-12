import React from "react";
import { createRoot } from "react-dom/client";
import PaymentView from "./src/views/PaymentView";
import "./src/styles/payment.css";

createRoot(document.getElementById("root")!).render(<PaymentView />);
