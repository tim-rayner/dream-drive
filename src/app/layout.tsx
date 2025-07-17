import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import NavBar from "../components/NavBar";
import { AuthProvider } from "../context/AuthContext";
import { CreditsProvider } from "../context/CreditsContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DreamDrive AI Studio - Generate AI Car Scenes",
  description:
    "Upload your car photo and place it anywhere in the world with AI-powered scene generation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <CreditsProvider>
            <NavBar />
            {children}
          </CreditsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
