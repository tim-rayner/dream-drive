import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ClientProviders from "../components/ClientProviders";
import StarryBackground from "../components/StarryBackground";
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
  title: "DriveDream AI Studio - Generate AI Car Scenes",
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
        <ClientProviders>
          <StarryBackground>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
              }}
            >
              <main style={{ flex: 1 }}>{children}</main>
              {/* Footer is now handled within individual pages */}
            </div>
          </StarryBackground>
        </ClientProviders>
      </body>
    </html>
  );
}
