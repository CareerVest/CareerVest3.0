"use client";

import React, { useState } from "react";
import { Pipeline } from "./components/Pipeline";
import { Client, UserRole } from "../types/pipelines/pipeline";
import { ClientDetails } from "./components/ClientDetails";

export default function PipelinesPage() {
  const currentUserRole: UserRole = "resume-writer"; // Simulating resume-writer role
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-[#682A53]">Pipelines</h1>
          <p className="text-sm text-gray-600 mt-1">
            Logged in as:{" "}
            <span className="font-medium text-indigo-600">Resume Writer</span>
          </p>
        </div>
      </div>

      <Pipeline
        currentUserRole={currentUserRole}
        onClientSelect={handleClientSelect}
      />

      <ClientDetails
        client={selectedClient}
        isOpen={isClientDetailsOpen}
        onClose={() => setIsClientDetailsOpen(false)}
        onUpdate={handleClientUpdate}
        currentUserRole={currentUserRole}
      />
    </div>
  );
}
