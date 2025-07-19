"use client";

import { AuthProvider } from "../context/AuthContext";
import { CreditsProvider } from "../context/CreditsContext";
import NavBar from "./NavBar";

interface ClientProvidersProps {
  children: React.ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <AuthProvider>
      <CreditsProvider>
        <NavBar />
        {children}
      </CreditsProvider>
    </AuthProvider>
  );
}
