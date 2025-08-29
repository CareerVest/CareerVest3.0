import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../contexts/authContext";
import { LoadingProvider } from "../contexts/loadingContext";
import GlobalSpinner from "../components/ui/globalSpinner";

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
          </LoadingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
