import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../contexts/authContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CareerVest - ShadCN Demo",
  description:
    "A beautiful Next.js project with shadcn/ui components and CareerVest branding",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
