import React from "react";
import { AuthService } from "../services/AuthService";

const Protected: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!AuthService.isAuthed()) {
    window.location.replace("/admin");
    return null;
  }
  return <>{children}</>;
};

export default Protected;
