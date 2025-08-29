"use client";

import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import AddClientButton from "./components/AddClientButton";
import type { ClientList as ClientListType } from "../types/Clients/ClientList";
import { fetchClients } from "./actions/clientActions";
import ClientList from "./components/ClientList";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/authContext";

import permissions from "../utils/permissions";

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientListType[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, isInitialized, user, login, roles } = useAuth();
  const router = useRouter();

  const userRole =
    roles.length > 0
      ? roles.includes("Admin")
        ? "Admin"
        : roles.includes("Sales_Executive")
        ? "Sales_Executive"
        : roles.includes("Recruiter")
        ? "Recruiter"
        : "default"
      : "default";

  useEffect(() => {
    if (!isInitialized) return;

    console.log("🔹 Auth State on Load:", {
      isAuthenticated,
      isInitialized,
      user,
      roles,
      userRole,
    });

    const checkAuthAndLoad = async () => {
      if (!isAuthenticated) {
        console.log(
          "❌ User Not Authenticated, Attempting Silent Re-authentication..."
        );
        try {
          const loginSuccess = await login();
          if (!loginSuccess) {
            console.log(
              "❌ Silent Re-authentication failed, Redirecting to /login..."
            );
            router.push("/login");
            return;
          }
        } catch (error) {
          console.error("❌ Re-authentication error:", error);
          router.push("/login");
          return;
        }
      }

      console.log("✅ Fetching Clients...");
      const loadClients = async () => {
        try {
          const fetchedClients = await fetchClients();
          console.log("🔹 Clients Received:", fetchedClients);
          setClients(fetchedClients);
        } catch (error) {
          console.error("❌ Failed to fetch clients:", error);
          if (
            error instanceof Error &&
            error.message.includes("Authentication required")
          ) {
            console.log("🔸 Token expired or missing, redirecting to login...");
            router.push("/login");
          }
        } finally {
          setLoading(false);
        }
      };

      loadClients();
    };

    checkAuthAndLoad();
  }, [isAuthenticated, isInitialized, router, login, roles]);

  if (!isInitialized || !isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-50vh w-full">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-[#682A53]">Clients</h1>
        {permissions.clients[userRole]?.addClient && <AddClientButton />}
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-50vh w-full">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-sm text-muted-foreground">
              Loading clients...
            </span>
          </div>
        </div>
      ) : (
        <ClientList clients={clients} />
      )}
    </div>
  );
}
