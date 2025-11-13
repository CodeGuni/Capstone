import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AdminLogin from "./views/AdminLogin";
import AdminDashboard from "./views/AdminDashboard";
import Protected from "./views/Protected";
import "./styles/ui.css";

const router = createBrowserRouter([
  { path: "/", element: <AdminLogin /> },
  { path: "/admin", element: <AdminLogin /> },
  {
    path: "/dashboard",
    element: (
      <Protected>
        <AdminDashboard />
      </Protected>
    ),
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
