"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { ArrowLeft, Edit, AlertCircle, User } from "lucide-react";
import { useAuth } from "../../../contexts/authContext";
import { getEmployee } from "../actions/employeeActions";
import { useApiWithLoading } from "../../../lib/apiWithLoading";
import type { EmployeeDetail } from "../../types/employees/employeeDetail";
import permissions from "../../utils/permissions";

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { roles, isInitialized } = useAuth();
  const { apiCall } = useApiWithLoading();
  const [employee, setEmployee] = useState<EmployeeDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const employeeId = parseInt(params.id as string);

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

    const fetchEmployee = async () => {
      try {
        const employeeData = await apiCall(getEmployee(employeeId), { showLoading: true });
        setEmployee(employeeData);
      } catch (error) {
        console.error("Error fetching employee:", error);
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Failed to fetch employee details");
        }
      }
    };

    fetchEmployee();
  }, [employeeId, isInitialized]);

  const handleBack = () => {
    const params = new URLSearchParams(searchParams.toString());
    router.push(`/employees?${params.toString()}`);
  };

  const handleEdit = () => {
    if (permissions.employees[userRole]?.editEmployee) {
      const params = new URLSearchParams(searchParams.toString());
      router.push(`/employees/${employeeId}/edit?${params.toString()}`);
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return "N/A";
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return "N/A";
    return parsedDate.toLocaleDateString();
  };

  const getStatusVariant = (status: string | null) => {
    if (status === "Active") return "default";
    if (status === "Inactive") return "secondary";
    return "outline";
  };

  if (!isInitialized) {
    return (
      <div className="flex justify-center items-center h-50vh w-full">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  if (!permissions.employees[userRole]?.viewEmployee) {
    return (
      <div className="flex justify-center items-center h-50vh w-full">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-red-600">
            You do not have permission to view employee details.
          </h2>
        </div>
      </div>
    );
  }



  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center space-x-2">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-600">
            Employee not found.
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Modern Header */}
      <div className="mb-8">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={handleBack}
            className="bg-[#682A53] hover:bg-[#682A53]/90 text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Employees
          </Button>
          <div className="flex items-center space-x-2">
            {permissions.employees[userRole]?.editEmployee && (
              <Button
                onClick={handleEdit}
                className="bg-[#682A53] hover:bg-[#682A53]/90 text-white"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Employee
              </Button>
            )}
          </div>
        </div>

        {/* Employee Info Header */}
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-[#682A53] rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {employee.FirstName} {employee.LastName}
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant={getStatusVariant(employee.Status) as any}>
                    {employee.Status}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-[#682A53]">
                {employee.Role}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  First Name
                </label>
                <p className="text-sm">{employee.FirstName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Last Name
                </label>
                <p className="text-sm">{employee.LastName}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">
                Personal Email
              </label>
              <p className="text-sm">{employee.PersonalEmailAddress}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">
                Company Email
              </label>
              <p className="text-sm">{employee.CompanyEmailAddress || "N/A"}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">
                Phone Number
              </label>
              <p className="text-sm">
                {employee.PersonalPhoneNumber
                  ? `${
                      employee.PersonalPhoneCountryCode
                        ? `+${employee.PersonalPhoneCountryCode} `
                        : ""
                    }${employee.PersonalPhoneNumber}`
                  : "N/A"}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">
                Employee Reference ID
              </label>
              <p className="text-sm">{employee.EmployeeReferenceID || "N/A"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Employment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Role</label>
              <p className="text-sm">{employee.Role}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">
                Status
              </label>
              <div className="mt-1">
                <Badge variant={getStatusVariant(employee.Status) as any}>
                  {employee.Status}
                </Badge>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">
                Joined Date
              </label>
              <p className="text-sm">{formatDate(employee.JoinedDate)}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">
                Terminated Date
              </label>
              <p className="text-sm">{formatDate(employee.TerminatedDate)}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">
                Supervisor
              </label>
              <p className="text-sm">{employee.SupervisorName || "N/A"}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">
                Company Comments
              </label>
              <p className="text-sm whitespace-pre-wrap">
                {employee.CompanyComments || "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
