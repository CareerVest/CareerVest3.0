"use client";

import React, { useState } from "react";
import { Pipeline } from "./components/Pipeline";
import { Client, UserRole } from "../types/pipelines/pipeline";
import { ClientDetailsSidebar } from "./components/ClientDetailsSidebar";
import { usePipelineActions } from "./actions/pipelineActions";
import { useAuth } from "../../contexts/authContext";

export default function PipelinesPage() {
  console.log("PipelinesPage rendered");
  const { roles } = useAuth();
  const { getPipelineCandidateById } = usePipelineActions();
  
  // Determine user role from auth context
  const currentUserRole: UserRole = roles.length > 0 
    ? (roles.includes("Admin") 
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
        : "Admin") // fallback to Admin
    : "Admin"; // fallback if no roles
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isClientDetailsOpen, setIsClientDetailsOpen] = useState(false);

  const handleClientUpdate = (updatedClient: Client) => {
    // In a real app, this would update the database
    console.log("Client updated:", updatedClient);
    setSelectedClient(updatedClient);
  };

  const handleClientSelect = async (client: Client) => {
    try {
      // Fetch fresh client data from the API using our action
      console.log("🔄 Fetching fresh data for client:", client.id);
      const freshClientData = await getPipelineCandidateById(client.id);

      console.log("✅ Fresh client data received:", freshClientData);

      setSelectedClient(freshClientData);
      setIsClientDetailsOpen(true);
    } catch (error) {
      console.error("❌ Error fetching fresh client data:", error);
      // Fallback to the original client data if API call fails
      setSelectedClient(client);
      setIsClientDetailsOpen(true);
    }
  };

  const handleCloseSidebar = () => {
    setIsClientDetailsOpen(false);
    setSelectedClient(null);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-[#682A53]">Pipelines</h1>
          <p className="text-sm text-gray-600 mt-1">
            Logged in as:{" "}
            <span className="font-medium text-indigo-600">
              {currentUserRole.charAt(0).toUpperCase() +
                currentUserRole.slice(1)}
            </span>
          </p>
        </div>
      </div>

      <Pipeline
        currentUserRole={currentUserRole}
        onClientSelect={handleClientSelect}
        isSidebarOpen={isClientDetailsOpen}
        onClientUpdate={handleClientUpdate}
      />

      <ClientDetailsSidebar
        client={selectedClient}
        isOpen={isClientDetailsOpen}
        onClose={handleCloseSidebar}
        onRefresh={() => selectedClient && handleClientSelect(selectedClient)}
        currentUserRole={currentUserRole}
      />
    </div>
  );
}
