"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getEmployee } from "../../actions/employeeActions";
import { useApiWithLoading } from "../../../../lib/apiWithLoading";
import type { EmployeeDetail } from "../../../types/employees/employeeDetail";
import { useAuth } from "../../../../contexts/authContext";
import permissions from "../../../utils/permissions";
import EditEmployeeForm from "../../components/EditEmployeeForm";

export default function EditEmployeePage() {
  const [employee, setEmployee] = useState<EmployeeDetail | null>(null);
  const params = useParams();
  const router = useRouter();
  const { roles } = useAuth();
  const { apiCall } = useApiWithLoading();
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
    const fetchEmployee = async () => {
      try {
        const employeeData = await apiCall(getEmployee(employeeId), { showLoading: true });
        if (employeeData) {
          setEmployee(employeeData);
        } else {
          console.error("Employee not found");
          router.push("/employees");
        }
      } catch (error) {
        console.error("Failed to fetch employee:", error);
        router.push("/employees");
      }
    };

    fetchEmployee();
  }, [employeeId, router]);

  const canEdit = permissions.employees[userRole]?.editEmployee === true;



  if (!employee) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Employee Not Found</h2>
          <p className="text-gray-600 mt-2">The requested employee could not be found.</p>
        </div>
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Access Denied</h2>
          <p className="text-gray-600 mt-2">You don't have permission to edit this employee.</p>
        </div>
      </div>
    );
  }

  return (
    <EditEmployeeForm
      employee={employee}
      userRole={userRole}
      permissions={permissions}
      canEdit={canEdit}
    />
  );
}
