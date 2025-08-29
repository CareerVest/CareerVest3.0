"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Textarea } from "../../../components/ui/textarea";
import { AlertCircle } from "lucide-react";
import type { EmployeeDetail } from "../../types/employees/employeeDetail";
import { useAuth } from "../../../contexts/authContext";
import { useEmployeeActions } from "../actions/employeeActions";
import { EmployeeList } from "../../types/employees/employeeList";
import permissions from "../../utils/permissions";

// Define VALID_ROLES constant locally
const VALID_ROLES = [
  "Bench Sales Recruiter",
  "CEO",
  "Lead Generation And Sales Executive",
  "Marketing Manager",
  "Resume Writer",
  "Sales Executive",
  "Senior Recruiter",
  "Trainee Bench Sales Recruiter",
];

export default function CreateEmployeeForm() {
  const router = useRouter();
  const { createEmployee, fetchEmployees } = useEmployeeActions();
  const [formData, setFormData] = useState<EmployeeDetail>({
    EmployeeID: 0, // Placeholder for new employee
    FirstName: "",
    LastName: "",
    PersonalEmailAddress: "",
    CompanyEmailAddress: "",
    PersonalPhoneNumber: "",
    PersonalPhoneCountryCode: "",
    JoinedDate: null,
    Status: "Active",
    TerminatedDate: null,
    Role: "",
    SupervisorID: null,
    SupervisorName: "",
    EmployeeReferenceID: "",
    CompanyComments: "",
    CreatedTS: null,
    UpdatedTS: null,
  });
  const [supervisors, setSupervisors] = useState<EmployeeList[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const { roles, isInitialized } = useAuth();

  // Determine user role with Azure AD casing, default to "default" if not initialized
  const userRole: keyof typeof permissions.employees =
    isInitialized && roles.length > 0
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

  // Get current user's employee ID, default to 0 if not initialized
  const currentEmployeeId =
    isInitialized && roles.length > 0
      ? parseInt(
          roles
            .find((r) => r.includes("EmployeeID"))
            ?.split("EmployeeID_")[1] || "0"
        )
      : 0;

  // Check if user can create employees
  const canCreate =
    isInitialized && permissions.employees[userRole]?.addEmployee === true;

  useEffect(() => {
    if (!isInitialized) return;

    if (!canCreate) {
      setError("Unauthorized: You do not have permission to create employees.");
      return;
    }

    const fetchSupervisors = async () => {
      try {
        const employees = await fetchEmployees();
        console.log("Fetched employees for supervisors:", employees);
        // Filter supervisors based on permissions
        const validSupervisors = employees.filter((emp) => {
          if (userRole === "Admin") return true;
          if (userRole === "Senior_Recruiter")
            return (
              emp.EmployeeID === currentEmployeeId ||
              emp.SupervisorID === currentEmployeeId
            );
          return emp.EmployeeID === currentEmployeeId;
        });
        console.log("Filtered supervisors:", validSupervisors);
        setSupervisors(validSupervisors);
      } catch (error) {
        console.error("Failed to fetch supervisors:", error);
        setError("Failed to load supervisors. Please try again.");
      }
    };
    fetchSupervisors();
  }, [userRole, currentEmployeeId, isInitialized, canCreate]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (canCreate) {
      let processedValue = value;

      // Handle date fields
      if (name === "JoinedDate" && value) {
        processedValue = new Date(value).toISOString();
      }

      setFormData((prevData) => ({
        ...prevData,
        [name]: processedValue,
      }));
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    if (canCreate) {
      const processedValue =
        name === "SupervisorID"
          ? value === "none" || value === ""
            ? null
            : Number(value)
          : value === ""
          ? null
          : String(value);
      setFormData((prevData) => ({
        ...prevData,
        [name]: processedValue,
      }));
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleTextareaChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    if (canCreate) {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.FirstName?.trim()) {
      newErrors.FirstName = "First Name is required";
    }
    if (!formData.LastName?.trim()) {
      newErrors.LastName = "Last Name is required";
    }
    if (!formData.PersonalEmailAddress?.trim()) {
      newErrors.PersonalEmailAddress = "Personal Email Address is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.PersonalEmailAddress)
    ) {
      newErrors.PersonalEmailAddress = "Invalid email format";
    }
    if (!formData.CompanyEmailAddress?.trim()) {
      newErrors.CompanyEmailAddress = "Company Email Address is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.CompanyEmailAddress)
    ) {
      newErrors.CompanyEmailAddress = "Invalid email format";
    }
    if (!formData.PersonalPhoneNumber?.trim()) {
      newErrors.PersonalPhoneNumber = "Personal Phone Number is required";
    } else if (
      !/^\d{10}$|^\d{3}-\d{3}-\d{4}$/.test(
        formData.PersonalPhoneNumber.replace(/-/g, "")
      )
    ) {
      newErrors.PersonalPhoneNumber =
        "Phone number should be 10 digits (e.g., 1234567890 or 123-456-7890)";
    }
    if (!formData.PersonalPhoneCountryCode?.trim()) {
      newErrors.PersonalPhoneCountryCode =
        "Personal Phone Country Code is required";
    }
    if (!formData.JoinedDate) {
      newErrors.JoinedDate = "Joined Date is required";
    }
    if (!formData.EmployeeReferenceID?.trim()) {
      newErrors.EmployeeReferenceID = "Employee Reference ID is required";
    }
    if (!formData.Role?.trim()) {
      newErrors.Role = "Role is required";
    } else if (!VALID_ROLES.includes(formData.Role)) {
      newErrors.Role = "Invalid role selected";
    }
    if (!formData.Status?.trim()) {
      newErrors.Status = "Status is required";
    }

    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!canCreate) {
      setError("Unauthorized: You do not have permission to create employees.");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setError(null);
    try {
      console.log("Submitting form data:", formData);
      await createEmployee(formData);
      router.push("/employees");
      router.refresh();
    } catch (error) {
      console.error("Failed to create employee:", error);
      setError("Failed to create employee. Please try again.");
    }
  };

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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {permissions.employees[userRole]?.basicInfo?.view && (
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="FirstName">First Name *</Label>
                  <Input
                    id="FirstName"
                    name="FirstName"
                    value={formData.FirstName || ""}
                    onChange={handleInputChange}
                    className={
                      validationErrors.FirstName ? "border-red-500" : ""
                    }
                  />
                  {validationErrors.FirstName && (
                    <p className="text-sm text-red-500">
                      {validationErrors.FirstName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="LastName">Last Name *</Label>
                  <Input
                    id="LastName"
                    name="LastName"
                    value={formData.LastName || ""}
                    onChange={handleInputChange}
                    className={
                      validationErrors.LastName ? "border-red-500" : ""
                    }
                  />
                  {validationErrors.LastName && (
                    <p className="text-sm text-red-500">
                      {validationErrors.LastName}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="PersonalEmailAddress">
                  Personal Email Address *
                </Label>
                <Input
                  id="PersonalEmailAddress"
                  name="PersonalEmailAddress"
                  type="email"
                  value={formData.PersonalEmailAddress || ""}
                  onChange={handleInputChange}
                  className={
                    validationErrors.PersonalEmailAddress
                      ? "border-red-500"
                      : ""
                  }
                />
                {validationErrors.PersonalEmailAddress && (
                  <p className="text-sm text-red-500">
                    {validationErrors.PersonalEmailAddress}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="CompanyEmailAddress">
                  Company Email Address *
                </Label>
                <Input
                  id="CompanyEmailAddress"
                  name="CompanyEmailAddress"
                  type="email"
                  value={formData.CompanyEmailAddress || ""}
                  onChange={handleInputChange}
                  className={
                    validationErrors.CompanyEmailAddress ? "border-red-500" : ""
                  }
                />
                {validationErrors.CompanyEmailAddress && (
                  <p className="text-sm text-red-500">
                    {validationErrors.CompanyEmailAddress}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="PersonalPhoneNumber">Phone Number *</Label>
                  <Input
                    id="PersonalPhoneNumber"
                    name="PersonalPhoneNumber"
                    value={formData.PersonalPhoneNumber || ""}
                    onChange={handleInputChange}
                    className={
                      validationErrors.PersonalPhoneNumber
                        ? "border-red-500"
                        : ""
                    }
                  />
                  {validationErrors.PersonalPhoneNumber && (
                    <p className="text-sm text-red-500">
                      {validationErrors.PersonalPhoneNumber}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="PersonalPhoneCountryCode">
                    Country Code *
                  </Label>
                  <Input
                    id="PersonalPhoneCountryCode"
                    name="PersonalPhoneCountryCode"
                    value={formData.PersonalPhoneCountryCode || ""}
                    onChange={handleInputChange}
                    className={
                      validationErrors.PersonalPhoneCountryCode
                        ? "border-red-500"
                        : ""
                    }
                  />
                  {validationErrors.PersonalPhoneCountryCode && (
                    <p className="text-sm text-red-500">
                      {validationErrors.PersonalPhoneCountryCode}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="JoinedDate">Joined Date *</Label>
                <Input
                  id="JoinedDate"
                  name="JoinedDate"
                  type="date"
                  value={
                    formData.JoinedDate
                      ? new Date(formData.JoinedDate)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  onChange={handleInputChange}
                  className={
                    validationErrors.JoinedDate ? "border-red-500" : ""
                  }
                />
                {validationErrors.JoinedDate && (
                  <p className="text-sm text-red-500">
                    {validationErrors.JoinedDate}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="EmployeeReferenceID">
                  Employee Reference ID *
                </Label>
                <Input
                  id="EmployeeReferenceID"
                  name="EmployeeReferenceID"
                  value={formData.EmployeeReferenceID || ""}
                  onChange={handleInputChange}
                  className={
                    validationErrors.EmployeeReferenceID ? "border-red-500" : ""
                  }
                />
                {validationErrors.EmployeeReferenceID && (
                  <p className="text-sm text-red-500">
                    {validationErrors.EmployeeReferenceID}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Role & Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="Role">Role *</Label>
              <Select
                value={formData.Role || ""}
                onValueChange={(value) => handleSelectChange("Role", value)}
              >
                <SelectTrigger
                  className={validationErrors.Role ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {VALID_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors.Role && (
                <p className="text-sm text-red-500">{validationErrors.Role}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="Status">Status *</Label>
              <Select
                value={formData.Status || ""}
                onValueChange={(value) => handleSelectChange("Status", value)}
              >
                <SelectTrigger
                  className={validationErrors.Status ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              {validationErrors.Status && (
                <p className="text-sm text-red-500">
                  {validationErrors.Status}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="SupervisorID">Supervisor</Label>
              <Select
                value={formData.SupervisorID?.toString() || "none"}
                onValueChange={(value) =>
                  handleSelectChange("SupervisorID", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select supervisor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Supervisor</SelectItem>
                  {supervisors.map((supervisor) => (
                    <SelectItem
                      key={supervisor.EmployeeID}
                      value={supervisor.EmployeeID.toString()}
                    >
                      {supervisor.FirstName} {supervisor.LastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="CompanyComments">Company Comments</Label>
              <Textarea
                id="CompanyComments"
                name="CompanyComments"
                value={formData.CompanyComments || ""}
                onChange={handleTextareaChange}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/employees")}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!canCreate}
          className="bg-[#682A53] hover:bg-[#5a2347] text-white"
        >
          Create Employee
        </Button>
      </div>
    </form>
  );
}
