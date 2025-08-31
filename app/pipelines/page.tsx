"use client";

import React, { useState } from "react";
import { Pipeline } from "./components/Pipeline";
import { Client, UserRole } from "../types/pipelines/pipeline";
import { ClientDetailsSidebar } from "./components/ClientDetailsSidebar";

export default function PipelinesPage() {
  const currentUserRole: UserRole = "marketing-manager"; // Simulating marketing-manager role
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isClientDetailsOpen, setIsClientDetailsOpen] = useState(false);

  const handleClientUpdate = (updatedClient: Client) => {
    // In a real app, this would update the database
    console.log("Client updated:", updatedClient);
    setSelectedClient(updatedClient);
  };

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setIsClientDetailsOpen(true);
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
              Marketing Manager
            </span>
          </p>
        </div>
      </div>

      <Pipeline
        currentUserRole={currentUserRole}
        onClientSelect={handleClientSelect}
      />

      <ClientDetailsSidebar
        client={selectedClient}
        isOpen={isClientDetailsOpen}
        onClose={handleCloseSidebar}
        onUpdate={handleClientUpdate}
        currentUserRole={currentUserRole}
      />
    </div>
  );
}
