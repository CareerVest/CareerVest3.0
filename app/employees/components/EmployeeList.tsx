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
import { Search, Eye, Edit, Trash2, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import type { EmployeeList } from "../../types/employees/employeeList";
import { useAuth } from "../../../contexts/authContext";
import { inactivateEmployee } from "../actions/employeeActions";
import permissions from "../../utils/permissions";

interface EmployeeListProps {
  employees: EmployeeList[];
}

export default function EmployeeList({
  employees: initialEmployees,
}: EmployeeListProps) {
  const [employees, setEmployees] = useState<EmployeeList[]>(initialEmployees);

  // Update local state when props change
  useEffect(() => {
    setEmployees(initialEmployees);
  }, [initialEmployees]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToInactivate, setEmployeeToInactivate] = useState<
    number | null
  >(null);
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

  // Get current user's employee ID
  const currentEmployeeId =
    roles.length > 0
      ? parseInt(
          roles
            .find((r) => r.includes("EmployeeID"))
            ?.split("EmployeeID_")[1] || "0"
        )
      : 0;

  // Update URL when search term changes
  const updateSearchParams = useCallback(
    (newSearchTerm: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newSearchTerm.trim()) {
        params.set("search", newSearchTerm);
      } else {
        params.delete("search");
      }
      router.replace(`/employees?${params.toString()}`);
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

  const handleView = useCallback(
    (id: number) => {
      if (permissions.employees[userRole]?.viewEmployee) {
        // Preserve search state in URL when navigating
        const params = new URLSearchParams(searchParams.toString());
        router.push(`/employees/${id}?${params.toString()}`);
      }
    },
    [router, userRole, searchParams]
  );

  const handleEdit = useCallback(
    (id: number) => {
      if (permissions.employees[userRole]?.editEmployee) {
        // Preserve search state in URL when navigating
        const params = new URLSearchParams(searchParams.toString());
        router.push(`/employees/${id}/edit?${params.toString()}`);
      }
    },
    [router, userRole, searchParams]
  );

  const handleDeleteClick = useCallback(
    (id: number) => {
      if (permissions.employees[userRole]?.deleteEmployee) {
        setEmployeeToInactivate(id);
        setDeleteDialogOpen(true);
      }
    },
    [userRole]
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (employeeToInactivate === null) return;

    try {
      setDeleteError(null);
      const success = await inactivateEmployee(employeeToInactivate);
      if (success) {
        setEmployees(
          employees.filter(
            (employee) => employee.EmployeeID !== employeeToInactivate
          )
        );
        setDeleteDialogOpen(false);
        setEmployeeToInactivate(null);
      }
    } catch (error) {
      console.error("Error inactivating employee:", error);
      if (error instanceof Error) {
        setDeleteError(
          error.message || "Failed to inactivate employee. Please try again."
        );
      } else {
        setDeleteError("Failed to inactivate employee. Please try again.");
      }
    }
  }, [employeeToInactivate, employees]);

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setEmployeeToInactivate(null);
    setDeleteError(null);
  };

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
    if (status === "Active") return "default";
    if (status === "Inactive") return "secondary";
    return "outline";
  };

  const filteredEmployees = useMemo(() => {
    let filtered = employees;

    // Apply search filter
    if (searchTerm.trim()) {
      const keywords = searchTerm.toLowerCase().split(/\s+/);
      filtered = employees.filter((employee) =>
        keywords.every((keyword) =>
          Object.values(employee).some(
            (value) => value && value.toString().toLowerCase().includes(keyword)
          )
        )
      );
    }

    // Sort by joined date (newest to oldest)
    return filtered.sort((a, b) => {
      const dateA = a.JoinedDate ? new Date(a.JoinedDate).getTime() : 0;
      const dateB = b.JoinedDate ? new Date(b.JoinedDate).getTime() : 0;
      return dateB - dateA; // Newest first
    });
  }, [employees, searchTerm]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search employees..."
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
              <TableHead>Employee Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Joined Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.map((employee) => (
              <TableRow key={employee.EmployeeID}>
                <TableCell className="font-medium">
                  {employee.FirstName} {employee.LastName}
                </TableCell>
                <TableCell>{employee.Role || "N/A"}</TableCell>
                <TableCell>{employee.PersonalEmailAddress || "N/A"}</TableCell>
                <TableCell>{formatDate(employee.JoinedDate)}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(employee.Status) as any}>
                    {employee.Status || "N/A"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    {permissions.employees[userRole]?.viewEmployee && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(employee.EmployeeID)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    {permissions.employees[userRole]?.editEmployee && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(employee.EmployeeID)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {permissions.employees[userRole]?.deleteEmployee &&
                      employee.EmployeeID !== currentEmployeeId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(employee.EmployeeID)}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inactivate Employee</DialogTitle>
            <DialogDescription>
              Are you sure you want to inactivate this employee? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deleteError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {deleteError}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleDeleteCancel}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Inactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
