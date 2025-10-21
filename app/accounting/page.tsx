"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/authContext";
import { useRouter } from "next/navigation";
import { NewAccountingHub } from "./components/NewAccountingHub";

export default function AccountingPage() {
  const { isAuthenticated, isInitialized, login, roles } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAccounting = async () => {
      if (!isInitialized) return;

      if (!isAuthenticated) {
        const loginSuccess = await login();
        if (!loginSuccess) {
          setError("Please log in to view the accounting module.");
          router.push("/login");
          return;
        }
      }

      try {
        // Check if user has accounting permissions (Admin only)
        const hasAccountingAccess = roles.includes("Admin");
        if (!hasAccountingAccess) {
          setError(
            "You don't have permission to access the accounting module."
          );
          router.push("/dashboard");
          return;
        }
      } catch (err: any) {
        console.error("Error in initializeAccounting:", err);
        setError(err.message || "Failed to load accounting module.");
        if (err.message.includes("token") || err.message.includes("login")) {
          router.push("/login");
        }
      }
    };

    initializeAccounting();
  }, [isAuthenticated, isInitialized, login, router, roles]);

  if (!isInitialized) {
    return (
      <div className="flex justify-center items-center h-50vh w-full">
        <div className="text-center">
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 w-full">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return <NewAccountingHub />;
}
