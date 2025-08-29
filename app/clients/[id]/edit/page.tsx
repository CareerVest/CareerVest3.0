"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getClient } from "../../actions/clientActions";
import type { ClientDetail } from "../../../types/Clients/ClientDetail";
import { useAuth } from "../../../../contexts/authContext";
import permissions from "../../../utils/permissions";
import EditClientForm from "../../components/EditClientForm";

export default function EditClientPage({ params }: { params: { id: string } }) {
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { roles } = useAuth();

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
    const fetchClient = async () => {
      try {
        const clientData = await getClient(Number(params.id));
        if (clientData) {
          setClient(clientData);
        } else {
          console.error("Client not found");
          router.push("/clients");
        }
      } catch (error) {
        console.error("Failed to fetch client:", error);
        router.push("/clients");
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [params.id, router]);

  const canEdit =
    !!permissions.clients[userRole]?.basicInfo.edit ||
    (typeof permissions.clients[userRole]?.marketingInfo.edit === "object"
      ? Object.values(permissions.clients[userRole]?.marketingInfo.edit || {}).some(
          (v) => v
        )
      : !!permissions.clients[userRole]?.marketingInfo.edit) ||
    !!permissions.clients[userRole]?.subscriptionInfo.edit ||
    !!permissions.clients[userRole]?.postPlacementInfo.edit;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-50vh w-full">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-sm text-muted-foreground">Loading client...</span>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Client Not Found</h2>
          <p className="text-gray-600 mt-2">The requested client could not be found.</p>
        </div>
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Access Denied</h2>
          <p className="text-gray-600 mt-2">You don't have permission to edit this client.</p>
        </div>
      </div>
    );
  }

  return (
    <EditClientForm
      client={client}
      userRole={userRole}
      permissions={permissions}
      canEdit={canEdit}
    />
  );
}
