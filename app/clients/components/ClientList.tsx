"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Search, Eye, Edit, Trash2, Loader2, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ClientList } from "../../types/Clients/ClientList";
import { useAuth } from "../../../contexts/authContext";
import { deleteClient } from "../actions/clientActions";

interface ClientListProps {
  clients: ClientList[];
}

import permissions from "../../utils/permissions";

export default function ClientList({
  clients: initialClients,
}: ClientListProps) {
  const [clients, setClients] = useState<ClientList[]>(initialClients);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { roles } = useAuth();

  // Initialize search term from URL params
  const [searchTerm, setSearchTerm] = useState(() => {
    return searchParams.get("search") || "";
  });

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

  const handleView = useCallback(
    (id: number) => {
      if (permissions.clients[userRole]?.viewClient) {
        // Preserve search state in URL when navigating
        const params = new URLSearchParams(searchParams.toString());
        router.push(`/clients/${id}?${params.toString()}`);
      }
    },
    [router, userRole, searchParams]
  );

  const handleEdit = useCallback(
    (id: number) => {
      if (permissions.clients[userRole]?.editClient) {
        // Preserve search state in URL when navigating
        const params = new URLSearchParams(searchParams.toString());
        router.push(`/clients/${id}/edit?${params.toString()}`);
      }
    },
    [router, userRole, searchParams]
  );

  const handleDeleteClick = useCallback(
    (id: number) => {
      if (permissions.clients[userRole]?.deleteClient) {
        setClientToDelete(id);
        setDeleteDialogOpen(true);
      }
    },
    [userRole]
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (clientToDelete === null) return;

    try {
      setLoading(true);
      setDeleteError(null);
      const success = await deleteClient(clientToDelete);
      if (success) {
        setClients(
          clients.filter((client) => client.clientID !== clientToDelete)
        );
        console.log("✅ Client deleted successfully");
        setDeleteDialogOpen(false);
        setClientToDelete(null);
      }
    } catch (error) {
      console.error("Error deleting client:", error);
      if (error instanceof Error) {
        setDeleteError(
          error.message || "Failed to delete client. Please try again."
        );
      } else {
        setDeleteError("Failed to delete client. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [clientToDelete, clients]);

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setClientToDelete(null);
    setDeleteError(null);
  };

  // Update URL when search term changes
  const updateSearchParams = useCallback(
    (newSearchTerm: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newSearchTerm.trim()) {
        params.set("search", newSearchTerm);
      } else {
        params.delete("search");
      }
      router.replace(`/clients?${params.toString()}`);
    },
    [searchParams, router]
  );

  // Handle search term change
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchTerm(value);
      updateSearchParams(value);
    },
    [updateSearchParams]
  );

  // Handle clear search
  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
    updateSearchParams("");
  }, [updateSearchParams]);

  const formatDate = (date: string | Date | null) => {
    if (!date) return "N/A";
    const parsedDate = date instanceof Date ? date : new Date(date);
    if (isNaN(parsedDate.getTime())) return "N/A";
    const month = parsedDate.getMonth() + 1;
    const day = parsedDate.getDate();
    const year = parsedDate.getFullYear();
    return `${month.toString().padStart(2, "0")}/${day
      .toString()
      .padStart(2, "0")}/${year}`;
  };

  const getStatusVariant = (status: string | null) => {
    if (status === "Active") return "success";
    if (status === "Placed") return "default";
    return "secondary";
  };

  const filteredClients = useMemo(() => {
    let filtered = clients;

    // Apply search filter
    if (searchTerm.trim()) {
      const keywords = searchTerm.toLowerCase().split(/\s+/);
      filtered = clients.filter((client) =>
        keywords.every((keyword) =>
          Object.values(client).some(
            (value) => value && value.toString().toLowerCase().includes(keyword)
          )
        )
      );
    }

    // Sort by enrollment date (newest to oldest)
    return filtered.sort((a, b) => {
      const dateA = a.enrollmentDate ? new Date(a.enrollmentDate).getTime() : 0;
      const dateB = b.enrollmentDate ? new Date(b.enrollmentDate).getTime() : 0;
      return dateB - dateA; // Newest first
    });
  }, [clients, searchTerm]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search clients..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client Name</TableHead>
              <TableHead>Enrolled Date</TableHead>
              <TableHead>Tech Stack</TableHead>
              <TableHead>Sales Person</TableHead>
              <TableHead>Recruiter</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.map((client) => (
              <TableRow key={client.clientID}>
                <TableCell className="font-medium">
                  {client.clientName}
                </TableCell>
                <TableCell>{formatDate(client.enrollmentDate)}</TableCell>
                <TableCell>{client.techStack || "N/A"}</TableCell>
                <TableCell>{client.assignedSalesPersonName || "N/A"}</TableCell>
                <TableCell>{client.assignedRecruiterName || "N/A"}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(client.clientStatus) as any}>
                    {client.clientStatus || "N/A"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    {permissions.clients[userRole]?.viewClient && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(client.clientID)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    {permissions.clients[userRole]?.editClient && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(client.clientID)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {permissions.clients[userRole]?.deleteClient && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(client.clientID)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this client? This action cannot be
              undone, and all associated data, including payment schedules,
              plans, and files, will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          {deleteError && (
            <div className="text-red-600 text-sm">{deleteError}</div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleDeleteCancel}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={loading}
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
