import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../contexts/authContext";
import { LoadingProvider } from "../contexts/loadingContext";
import GlobalSpinner from "../components/ui/globalSpinner";
import { Toaster } from "../components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CareerVest",
  description: "CareerVest Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <LoadingProvider>
            {children}
            <GlobalSpinner />
            <Toaster
              position="top-right"
              expand={true}
              richColors
              closeButton
              toastOptions={{
                style: {
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                  border: '1px solid var(--border)',
                },
              }}
            />
          </LoadingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
