"use client";

import React, { useState, useEffect } from "react";
import AddClientButton from "./components/AddClientButton";
import type { ClientList as ClientListType } from "../types/Clients/ClientList";
import { fetchClients } from "./actions/clientActions";
import { useApiWithLoading } from "../../lib/apiWithLoading";
import ClientList from "./components/ClientList";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/authContext";

import permissions from "../utils/permissions";

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientListType[]>([]);
  const { isAuthenticated, isInitialized, user, login, roles } = useAuth();
  const { apiCall } = useApiWithLoading();
  const router = useRouter();

  const userRole =
    roles.length > 0
      ? roles.includes("Admin")
        ? "Admin"
        : roles.includes("Sales_Executive")
        ? "Sales_Executive"
        : roles.includes("Senior_Recruiter")
        ? "Senior_Recruiter"
        : roles.includes("Recruiter")
        ? "Recruiter"
        : roles.includes("Resume_Writer")
        ? "Resume_Writer"
        : roles.includes("Marketing_Manager")
        ? "Marketing_Manager"
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

      const loadClients = async () => {
        try {
          // Backend handles all role-based filtering automatically via AccessControlService
          // Just call fetchClients() for all roles - backend will return appropriate data
          const fetchedClients = await apiCall(fetchClients(), {
            showLoading: true,
          });
          console.log("🔹 Clients Received:", fetchedClients);
          setClients(fetchedClients);
        } catch (error) {
          console.error("❌ Failed to fetch clients:", error);
          if (
            error instanceof Error &&
            error.message.includes("Authentication required")
          ) {
            router.push("/login");
          }
        }
      };

      loadClients();
    };

    checkAuthAndLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isInitialized]);

  if (!isInitialized || !isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-50vh w-full">
        <div className="text-center">
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
      <ClientList clients={clients} />
    </div>
  );
}
