"use client";

import React, { useState, useEffect } from "react";
import AddEmployeeButton from "./components/AddEmployeeButton";
import type { EmployeeList as EmployeeListType } from "../types/employees/employeeList";
import { fetchEmployees } from "./actions/employeeActions";
import { useApiWithLoading } from "../../lib/apiWithLoading";
import EmployeeList from "@/app/employees/components/EmployeeList";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/authContext";

import permissions from "../utils/permissions";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeListType[]>([]);
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

      const loadEmployees = async () => {
        try {
          const fetchedEmployees = await apiCall(fetchEmployees(), {
            showLoading: true,
          });
          setEmployees(fetchedEmployees);
        } catch (error) {
          console.error("❌ Failed to fetch employees:", error);
          if (
            error instanceof Error &&
            error.message.includes("Authentication required")
          ) {
            router.push("/login");
          }
        }
      };

      loadEmployees();
    };

    checkAuthAndLoad();
  }, [isAuthenticated, isInitialized, router, login, roles]);

  if (!isInitialized || !isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-50vh w-full">
        <div className="text-center">
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  if (!permissions.employees[userRole]?.basicInfo?.view) {
    return (
      <div className="flex justify-center items-center h-50vh w-full">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-red-600">
            You do not have permission to view employees.
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-[#682A53]">Employees</h1>
        {permissions.employees[userRole]?.addEmployee && <AddEmployeeButton />}
      </div>
      <EmployeeList employees={employees} />
    </div>
  );
}
