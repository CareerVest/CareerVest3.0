"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  Loader2,
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Upload,
  Eye,
  EyeOff,
  Check,
  User,
  Mail,
  CreditCard,
  FileText,
} from "lucide-react";
import { createClient } from "../actions/clientActions";
import type {
  Client,
  SubscriptionPlan,
  PostPlacementPlan,
  PaymentSchedule,
} from "../../types/Clients/Client";
import { useAuth } from "../../../contexts/authContext";
import permissions from "../../utils/permissions";
import {
  getRecruiters,
  getSalesPersons,
} from "../../employees/actions/employeeActions";
import { Recruiter } from "../../types/employees/recruiter";
import { formatDateForInput, parseDateForState } from "../../utils/dateUtils";

const steps = [
  {
    id: 1,
    title: "Basic Information",
    icon: User,
    description: "Client details and contact info",
  },
  {
    id: 2,
    title: "Marketing & Assignment",
    icon: Mail,
    description: "Marketing details and team assignment",
  },
  {
    id: 3,
    title: "Subscription",
    icon: CreditCard,
    description: "Subscription plan and payment schedule",
  },
  {
    id: 4,
    title: "Post-Placement",
    icon: FileText,
    description: "Post-placement plan and documents",
  },
];

export default function CreateClientForm() {
  const router = useRouter();
  const { roles } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [salesPersons, setSalesPersons] = useState<Recruiter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [serviceAgreementFile, setServiceAgreementFile] = useState<File | null>(
    null
  );
  const [promissoryNoteFile, setPromissoryNoteFile] = useState<File | null>(
    null
  );
  const [serviceAgreementFileName, setServiceAgreementFileName] =
    useState<string>("");
  const [promissoryNoteFileName, setPromissoryNoteFileName] =
    useState<string>("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const initialClientData: Client = {
    clientID: 0,
    clientName: "",
    enrollmentDate: null,
    techStack: "",
    personalPhoneNumber: "",
    personalEmailAddress: "",
    assignedRecruiterID: null,
    assignedRecruiterName: "",
    assignedSalesPersonID: null,
    assignedSalesPersonName: "",
    visaStatus: "",
    linkedInURL: "",
    clientStatus: "Active",
    subscriptionPlanID: null,
    totalDue: 0.0,
    totalPaid: 0.0,
    postPlacementPlanID: null,
    marketingStartDate: null,
    marketingEndDate: null,
    marketingEmailID: "",
    marketingEmailPassword: "",
    placedDate: null,
    backedOutDate: null,
    backedOutReason: "",
    subscriptionPlan: {
      subscriptionPlanID: 0,
      planName: "",
      serviceAgreementUrl: null,
      subscriptionPlanPaymentStartDate: null,
      totalSubscriptionAmount: null,
      createdTS: null,
      createdBy: null,
      updatedTS: null,
      updatedBy: null,
    },
    postPlacementPlan: null,
    paymentSchedules: [],
    serviceAgreementUrl: null,
    promissoryNoteUrl: null,
  };

  const [clientData, setClientData] = useState<Client>(initialClientData);
  const [subscriptionPaymentSchedule, setSubscriptionPaymentSchedule] =
    useState<PaymentSchedule[]>([]);
  const [postPlacementPaymentSchedule, setPostPlacementPaymentSchedule] =
    useState<PaymentSchedule[]>([]);

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
    const fetchData = async () => {
      try {
        const [recruitersData, salesPersonsData] = await Promise.all([
          getRecruiters(),
          getSalesPersons(),
        ]);
        setRecruiters(recruitersData.$values || []);
        setSalesPersons(salesPersonsData.$values || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const totalDue = subscriptionPaymentSchedule.reduce(
      (sum, payment) => sum + (payment.amount || 0),
      0
    );
    const totalPaid = postPlacementPaymentSchedule.reduce(
      (sum, payment) => sum + (payment.amount || 0),
      0
    );

    const hasPostPlacementData =
      clientData.postPlacementPlan?.planName?.trim() ||
      clientData.postPlacementPlan?.postPlacementPlanPaymentStartDate ||
      clientData.postPlacementPlan?.totalPostPlacementAmount ||
      postPlacementPaymentSchedule.length > 0;

    // Auto-update subscription plan total amount
    if (totalDue > 0) {
      setClientData((prevData) => ({
        ...prevData,
        subscriptionPlan: {
          ...prevData.subscriptionPlan!,
          totalSubscriptionAmount: totalDue,
        },
      }));
    }

    // Auto-update post-placement plan total amount
    if (totalPaid > 0) {
      setClientData((prevData) => ({
        ...prevData,
        postPlacementPlan: {
          ...prevData.postPlacementPlan!,
          totalPostPlacementAmount: totalPaid,
        },
      }));
    }

    setClientData((prevData) => ({
      ...prevData,
      totalDue,
      totalPaid,
      paymentSchedules: [
        ...subscriptionPaymentSchedule.map((ps) => ({
          ...ps,
          paymentType: "Subscription" as const,
          paymentScheduleID: 0,
          clientID: 0,
          createdTS: null,
          createdBy: null,
          updatedTS: null,
          updatedBy: null,
        })),
        ...(hasPostPlacementData
          ? postPlacementPaymentSchedule.map((ps) => ({
              ...ps,
              paymentType: "PostPlacement" as const,
              paymentScheduleID: 0,
              clientID: 0,
              createdTS: null,
              createdBy: null,
              updatedTS: null,
              updatedBy: null,
            }))
          : []),
      ],
    }));
  }, [
    subscriptionPaymentSchedule,
    postPlacementPaymentSchedule,
    clientData.postPlacementPlan,
  ]);

  const handleInputChange = (field: string, value: any) => {
    if (field.includes(".")) {
      const parts = field.split(".");
      if (parts.length !== 2) return;
      const [prefix, fieldName] = parts;

      setClientData((prevData) => {
        if (prefix === "subscriptionPlan") {
          return {
            ...prevData,
            subscriptionPlan: {
              ...prevData.subscriptionPlan!,
              [fieldName]: fieldName.includes("Date")
                ? parseDateForState(value)
                : value,
            },
          };
        } else if (prefix === "postPlacementPlan") {
          const newValue = fieldName.includes("Date")
            ? parseDateForState(value)
            : value;
          return {
            ...prevData,
            postPlacementPlan: {
              ...prevData.postPlacementPlan!,
              [fieldName]: newValue,
            },
          };
        }
        return prevData;
      });
    } else {
      const newValue = field.includes("Date")
        ? parseDateForState(value)
        : value;
      setClientData((prev) => ({
        ...prev,
        [field]: newValue,
      }));
    }

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleFileChange = (
    field: "serviceAgreement" | "promissoryNote",
    file: File | null
  ) => {
    if (field === "serviceAgreement") {
      setServiceAgreementFile(file);
      setServiceAgreementFileName(file ? file.name : "");
    } else {
      setPromissoryNoteFile(file);
      setPromissoryNoteFileName(file ? file.name : "");
    }
  };

  const addPaymentRow = (type: "subscription" | "postPlacement") => {
    const newPayment: PaymentSchedule = {
      paymentDate: null,
      amount: 0,
      paymentType: type === "subscription" ? "Subscription" : "PostPlacement",
      paymentScheduleID: 0,
      clientID: 0,
      subscriptionPlanID: null,
      postPlacementPlanID: null,
      createdTS: null,
      createdBy: null,
      updatedTS: null,
      updatedBy: null,
      isPaid: false,
    };

    if (type === "subscription") {
      setSubscriptionPaymentSchedule([
        ...subscriptionPaymentSchedule,
        newPayment,
      ]);
    } else if (type === "postPlacement") {
      setPostPlacementPaymentSchedule([
        ...postPlacementPaymentSchedule,
        newPayment,
      ]);
    }
  };

  const removePaymentRow = (
    index: number,
    type: "subscription" | "postPlacement"
  ) => {
    if (type === "subscription") {
      setSubscriptionPaymentSchedule(
        subscriptionPaymentSchedule.filter((_, i) => i !== index)
      );
    } else if (type === "postPlacement") {
      setPostPlacementPaymentSchedule(
        postPlacementPaymentSchedule.filter((_, i) => i !== index)
      );
    }
  };

  const updatePaymentSchedule = (
    type: "subscription" | "postPlacement",
    index: number,
    field: keyof PaymentSchedule,
    value: string | number
  ) => {
    const updater = (prevSchedule: PaymentSchedule[]) =>
      prevSchedule.map((payment, i) =>
        i === index
          ? {
              ...payment,
              [field]:
                field === "paymentDate"
                  ? parseDateForState(value as string)
                  : field === "amount"
                  ? Number(value)
                  : value,
            }
          : payment
      );

    if (type === "subscription") {
      setSubscriptionPaymentSchedule(updater(subscriptionPaymentSchedule));

      // Auto-set payment start date to the first payment date
      if (field === "paymentDate" && index === 0) {
        const newDate = parseDateForState(value as string);
        setClientData((prevData) => ({
          ...prevData,
          subscriptionPlan: {
            ...prevData.subscriptionPlan!,
            subscriptionPlanPaymentStartDate: newDate,
          },
        }));
      }
    } else if (type === "postPlacement") {
      setPostPlacementPaymentSchedule(updater(postPlacementPaymentSchedule));

      // Auto-set payment start date to the first payment date
      if (field === "paymentDate" && index === 0) {
        const newDate = parseDateForState(value as string);
        setClientData((prevData) => ({
          ...prevData,
          postPlacementPlan: {
            ...prevData.postPlacementPlan!,
            postPlacementPlanPaymentStartDate: newDate,
          },
        }));
      }
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (step === 1) {
      if (!clientData.clientName.trim()) {
        newErrors.clientName = "Client name is required";
      }
      if (!clientData.enrollmentDate) {
        newErrors.enrollmentDate = "Enrollment date is required";
      }
      if (!clientData.techStack?.trim()) {
        newErrors.techStack = "Tech stack is required";
      }
      if (!clientData.visaStatus?.trim()) {
        newErrors.visaStatus = "Visa status is required";
      }
      if (!clientData.personalPhoneNumber?.trim()) {
        newErrors.personalPhoneNumber = "Phone number is required";
      }
      if (!clientData.personalEmailAddress?.trim()) {
        newErrors.personalEmailAddress = "Email address is required";
      } else if (!isValidEmail(clientData.personalEmailAddress)) {
        newErrors.personalEmailAddress = "Invalid email format";
      }
      if (clientData.linkedInURL && !isValidUrl(clientData.linkedInURL)) {
        newErrors.linkedInURL = "Invalid URL format";
      }
    }

    if (step === 2) {
      if (!clientData.assignedSalesPersonID) {
        newErrors.assignedSalesPerson = "Assigned sales person is required";
      }
      if (!clientData.clientStatus) {
        newErrors.clientStatus = "Client status is required";
      }
    }

    if (step === 3) {
      if (!clientData.subscriptionPlan?.planName?.trim()) {
        newErrors.subscriptionPlanName = "Subscription plan name is required";
      }
      if (!serviceAgreementFile) {
        newErrors.serviceAgreement = "Service agreement is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }

      // Skip post-placement step if client status is not "Placed"
      if (currentStep === 3 && clientData.clientStatus !== "Placed") {
        setCurrentStep(5); // Skip to final step
      } else {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const prevStep = () => {
    // Handle going back from final step when post-placement was skipped
    if (currentStep === 5 && clientData.clientStatus !== "Placed") {
      setCurrentStep(3);
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    // Don't allow going to post-placement step if status is not "Placed"
    if (step === 4 && clientData.clientStatus !== "Placed") {
      return;
    }

    if (step <= currentStep || completedSteps.includes(step - 1)) {
      setCurrentStep(step);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(currentStep)) {
      return;
    }

    setIsLoading(true);

    try {
      const hasPostPlacementData =
        clientData.postPlacementPlan?.planName?.trim() ||
        clientData.postPlacementPlan?.postPlacementPlanPaymentStartDate ||
        clientData.postPlacementPlan?.totalPostPlacementAmount ||
        postPlacementPaymentSchedule.length > 0;

      const submitData: Client = {
        ...clientData,
        enrollmentDate: clientData.enrollmentDate
          ? new Date(clientData.enrollmentDate)
          : null,
        marketingStartDate: clientData.marketingStartDate
          ? new Date(clientData.marketingStartDate)
          : null,
        marketingEndDate: clientData.marketingEndDate
          ? new Date(clientData.marketingEndDate)
          : null,
        placedDate: clientData.placedDate
          ? new Date(clientData.placedDate)
          : null,
        backedOutDate: clientData.backedOutDate
          ? new Date(clientData.backedOutDate)
          : null,
        postPlacementPlan: hasPostPlacementData
          ? clientData.postPlacementPlan
          : null,
        postPlacementPlanID: hasPostPlacementData
          ? clientData.postPlacementPlanID
          : null,
        paymentSchedules: [
          ...subscriptionPaymentSchedule,
          ...(hasPostPlacementData ? postPlacementPaymentSchedule : []),
        ].map((ps) => ({
          ...ps,
          paymentScheduleID: 0,
          clientID: 0,
          createdTS: null,
          createdBy: null,
          updatedTS: null,
          updatedBy: null,
        })),
      };

      const success = await createClient(
        submitData,
        serviceAgreementFile,
        promissoryNoteFile
      );
      if (success) {
        router.push("/clients");
      }
    } catch (error: any) {
      console.error("Error creating client:", error);
      alert(error.message || "Failed to create client");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push("/clients");
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <p className="text-gray-600">
                Enter the client's basic details and contact information
              </p>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientName">Client Name *</Label>
                <Input
                  id="clientName"
                  value={clientData.clientName}
                  onChange={(e) =>
                    handleInputChange("clientName", e.target.value)
                  }
                  className={errors.clientName ? "border-red-500" : ""}
                />
                {errors.clientName && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.clientName}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="enrollmentDate">Enrollment Date *</Label>
                <Input
                  id="enrollmentDate"
                  type="date"
                  value={formatDateForInput(clientData.enrollmentDate)}
                  onChange={(e) =>
                    handleInputChange("enrollmentDate", e.target.value)
                  }
                  className={errors.enrollmentDate ? "border-red-500" : ""}
                />
                {errors.enrollmentDate && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.enrollmentDate}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="techStack">Tech Stack *</Label>
                <Input
                  id="techStack"
                  value={clientData.techStack || ""}
                  onChange={(e) =>
                    handleInputChange("techStack", e.target.value)
                  }
                  placeholder="e.g., React, Node.js, TypeScript"
                  className={errors.techStack ? "border-red-500" : ""}
                />
                {errors.techStack && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.techStack}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="visaStatus">Visa Status *</Label>
                <Input
                  id="visaStatus"
                  value={clientData.visaStatus || ""}
                  onChange={(e) =>
                    handleInputChange("visaStatus", e.target.value)
                  }
                  className={errors.visaStatus ? "border-red-500" : ""}
                />
                {errors.visaStatus && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.visaStatus}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="personalPhoneNumber">Phone Number *</Label>
                <Input
                  id="personalPhoneNumber"
                  value={clientData.personalPhoneNumber || ""}
                  onChange={(e) =>
                    handleInputChange("personalPhoneNumber", e.target.value)
                  }
                  className={errors.personalPhoneNumber ? "border-red-500" : ""}
                />
                {errors.personalPhoneNumber && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.personalPhoneNumber}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="personalEmailAddress">Email Address *</Label>
                <Input
                  id="personalEmailAddress"
                  type="email"
                  value={clientData.personalEmailAddress || ""}
                  onChange={(e) =>
                    handleInputChange("personalEmailAddress", e.target.value)
                  }
                  className={
                    errors.personalEmailAddress ? "border-red-500" : ""
                  }
                />
                {errors.personalEmailAddress && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.personalEmailAddress}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="linkedInURL">LinkedIn URL</Label>
                <Input
                  id="linkedInURL"
                  value={clientData.linkedInURL || ""}
                  onChange={(e) =>
                    handleInputChange("linkedInURL", e.target.value)
                  }
                  className={errors.linkedInURL ? "border-red-500" : ""}
                />
                {errors.linkedInURL && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.linkedInURL}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Marketing & Assignment</CardTitle>
              <p className="text-gray-600">
                Configure marketing details and assign team members
              </p>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="marketingStartDate">Marketing Start Date</Label>
                <Input
                  id="marketingStartDate"
                  type="date"
                  value={formatDateForInput(clientData.marketingStartDate)}
                  onChange={(e) =>
                    handleInputChange("marketingStartDate", e.target.value)
                  }
                />
              </div>

              <div>
                <Label htmlFor="marketingEndDate">Marketing End Date</Label>
                <Input
                  id="marketingEndDate"
                  type="date"
                  value={formatDateForInput(clientData.marketingEndDate)}
                  onChange={(e) =>
                    handleInputChange("marketingEndDate", e.target.value)
                  }
                />
              </div>

              <div>
                <Label htmlFor="marketingEmailID">Marketing Email ID</Label>
                <Input
                  id="marketingEmailID"
                  value={clientData.marketingEmailID || ""}
                  onChange={(e) =>
                    handleInputChange("marketingEmailID", e.target.value)
                  }
                />
              </div>

              <div>
                <Label htmlFor="marketingEmailPassword">
                  Marketing Email Password
                </Label>
                <div className="relative">
                  <Input
                    id="marketingEmailPassword"
                    type={showPassword ? "text" : "password"}
                    value={clientData.marketingEmailPassword || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "marketingEmailPassword",
                        e.target.value
                      )
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="assignedRecruiter">Assigned Recruiter</Label>
                <Select
                  value={clientData.assignedRecruiterID?.toString() || ""}
                  onValueChange={(value) => {
                    const recruiter = recruiters.find(
                      (r) => r.employeeID.toString() === value
                    );
                    handleInputChange(
                      "assignedRecruiterID",
                      value ? parseInt(value) : null
                    );
                    handleInputChange(
                      "assignedRecruiterName",
                      recruiter
                        ? `${recruiter.firstName} ${recruiter.lastName}`
                        : ""
                    );
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select recruiter" />
                  </SelectTrigger>
                  <SelectContent>
                    {recruiters.map((recruiter) => (
                      <SelectItem
                        key={recruiter.employeeID}
                        value={recruiter.employeeID.toString()}
                      >
                        {recruiter.firstName} {recruiter.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="assignedSalesPerson">
                  Assigned Sales Person *
                </Label>
                <Select
                  value={clientData.assignedSalesPersonID?.toString() || ""}
                  onValueChange={(value) => {
                    const salesPerson = salesPersons.find(
                      (s) => s.employeeID.toString() === value
                    );
                    handleInputChange(
                      "assignedSalesPersonID",
                      value ? parseInt(value) : null
                    );
                    handleInputChange(
                      "assignedSalesPersonName",
                      salesPerson
                        ? `${salesPerson.firstName} ${salesPerson.lastName}`
                        : ""
                    );
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sales person" />
                  </SelectTrigger>
                  <SelectContent>
                    {salesPersons.map((salesPerson) => (
                      <SelectItem
                        key={salesPerson.employeeID}
                        value={salesPerson.employeeID.toString()}
                      >
                        {salesPerson.firstName} {salesPerson.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.assignedSalesPerson && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.assignedSalesPerson}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="clientStatus">Client Status *</Label>
                <Select
                  value={clientData.clientStatus}
                  onValueChange={(value) =>
                    handleInputChange("clientStatus", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Placed">Placed</SelectItem>
                    <SelectItem value="BackedOut">Backed Out</SelectItem>
                    <SelectItem value="ReMarketing">ReMarketing</SelectItem>
                    <SelectItem value="OnHold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
                {errors.clientStatus && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.clientStatus}
                  </p>
                )}
              </div>

              {clientData.clientStatus === "Placed" && (
                <div>
                  <Label htmlFor="placedDate">Placed Date</Label>
                  <Input
                    id="placedDate"
                    type="date"
                    value={formatDateForInput(clientData.placedDate)}
                    onChange={(e) =>
                      handleInputChange("placedDate", e.target.value)
                    }
                  />
                </div>
              )}

              {clientData.clientStatus === "BackedOut" && (
                <>
                  <div>
                    <Label htmlFor="backedOutDate">Backed Out Date</Label>
                    <Input
                      id="backedOutDate"
                      type="date"
                      value={formatDateForInput(clientData.backedOutDate)}
                      onChange={(e) =>
                        handleInputChange("backedOutDate", e.target.value)
                      }
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="backedOutReason">Backed Out Reason</Label>
                    <Textarea
                      id="backedOutReason"
                      value={clientData.backedOutReason || ""}
                      onChange={(e) =>
                        handleInputChange("backedOutReason", e.target.value)
                      }
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Information</CardTitle>
                <p className="text-gray-600">
                  Configure subscription plan and payment schedule
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="subscriptionPlan.planName">
                      Subscription Plan Name *
                    </Label>
                    <Input
                      id="subscriptionPlan.planName"
                      value={clientData.subscriptionPlan?.planName || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "subscriptionPlan.planName",
                          e.target.value
                        )
                      }
                      className={
                        errors.subscriptionPlanName ? "border-red-500" : ""
                      }
                    />
                    {errors.subscriptionPlanName && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.subscriptionPlanName}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="subscriptionPlan.subscriptionPlanPaymentStartDate">
                      Payment Start Date *
                    </Label>
                    <Input
                      id="subscriptionPlan.subscriptionPlanPaymentStartDate"
                      type="date"
                      value={formatDateForInput(
                        clientData.subscriptionPlan
                          ?.subscriptionPlanPaymentStartDate || null
                      )}
                      onChange={(e) =>
                        handleInputChange(
                          "subscriptionPlan.subscriptionPlanPaymentStartDate",
                          e.target.value
                        )
                      }
                      className={
                        errors.subscriptionPlanPaymentStartDate
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {errors.subscriptionPlanPaymentStartDate && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.subscriptionPlanPaymentStartDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="subscriptionPlan.totalSubscriptionAmount">
                      Total Subscription Amount *
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <Input
                        id="subscriptionPlan.totalSubscriptionAmount"
                        type="number"
                        value={
                          clientData.subscriptionPlan
                            ?.totalSubscriptionAmount || ""
                        }
                        onChange={(e) =>
                          handleInputChange(
                            "subscriptionPlan.totalSubscriptionAmount",
                            e.target.value
                          )
                        }
                        className="pl-8"
                        readOnly
                      />
                    </div>
                    {errors.subscriptionPlanTotalAmount && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.subscriptionPlanTotalAmount}
                      </p>
                    )}
                  </div>
                </div>

                {/* Service Agreement Upload */}
                <div>
                  <Label htmlFor="serviceAgreement">Service Agreement *</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Input
                      id="serviceAgreement"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) =>
                        handleFileChange(
                          "serviceAgreement",
                          e.target.files?.[0] || null
                        )
                      }
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        document.getElementById("serviceAgreement")?.click()
                      }
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Service Agreement
                    </Button>
                  </div>
                  {serviceAgreementFileName && (
                    <p className="text-sm text-gray-600 mt-2">
                      Selected: {serviceAgreementFileName}
                    </p>
                  )}
                  {errors.serviceAgreement && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.serviceAgreement}
                    </p>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Subscription Payment Schedule
                  </h3>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Payment Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead className="w-20">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subscriptionPaymentSchedule.map((payment, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Input
                                type="date"
                                value={formatDateForInput(payment.paymentDate)}
                                onChange={(e) =>
                                  updatePaymentSchedule(
                                    "subscription",
                                    index,
                                    "paymentDate",
                                    e.target.value
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                  $
                                </span>
                                <Input
                                  type="number"
                                  value={
                                    payment.amount === 0 ? "" : payment.amount
                                  }
                                  onChange={(e) =>
                                    updatePaymentSchedule(
                                      "subscription",
                                      index,
                                      "amount",
                                      e.target.value
                                    )
                                  }
                                  className="pl-8"
                                />
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  removePaymentRow(index, "subscription")
                                }
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addPaymentRow("subscription")}
                    className="mt-2"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Payment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 4:
        // Only show post-placement step if client status is "Placed"
        if (clientData.clientStatus !== "Placed") {
          return null;
        }

        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Post-Placement Information</CardTitle>
                <p className="text-gray-600">
                  Configure post-placement plan and payment schedule
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="postPlacementPlan.planName">
                      Post Placement Plan Name
                    </Label>
                    <Input
                      id="postPlacementPlan.planName"
                      value={clientData.postPlacementPlan?.planName || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "postPlacementPlan.planName",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="postPlacementPlan.postPlacementPlanPaymentStartDate">
                      Payment Start Date
                    </Label>
                    <Input
                      id="postPlacementPlan.postPlacementPlanPaymentStartDate"
                      type="date"
                      value={formatDateForInput(
                        clientData.postPlacementPlan
                          ?.postPlacementPlanPaymentStartDate || null
                      )}
                      onChange={(e) =>
                        handleInputChange(
                          "postPlacementPlan.postPlacementPlanPaymentStartDate",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="postPlacementPlan.totalPostPlacementAmount">
                      Total Post Placement Amount
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <Input
                        id="postPlacementPlan.totalPostPlacementAmount"
                        type="number"
                        value={
                          clientData.postPlacementPlan
                            ?.totalPostPlacementAmount || ""
                        }
                        onChange={(e) =>
                          handleInputChange(
                            "postPlacementPlan.totalPostPlacementAmount",
                            e.target.value
                          )
                        }
                        className="pl-8"
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                {/* Promissory Note Upload */}
                <div>
                  <Label htmlFor="promissoryNote">Promissory Note</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Input
                      id="promissoryNote"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) =>
                        handleFileChange(
                          "promissoryNote",
                          e.target.files?.[0] || null
                        )
                      }
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        document.getElementById("promissoryNote")?.click()
                      }
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Promissory Note
                    </Button>
                  </div>
                  {promissoryNoteFileName && (
                    <p className="text-sm text-gray-600 mt-2">
                      Selected: {promissoryNoteFileName}
                    </p>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Payment Schedule
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {postPlacementPaymentSchedule.map((payment, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-3 gap-2 p-2 bg-gray-50 rounded"
                      >
                        <Input
                          type="date"
                          value={formatDateForInput(payment.paymentDate)}
                          onChange={(e) =>
                            updatePaymentSchedule(
                              "postPlacement",
                              index,
                              "paymentDate",
                              e.target.value
                            )
                          }
                          className="text-xs h-8"
                        />
                        <Input
                          type="number"
                          placeholder="Amount"
                          value={payment.amount === 0 ? "" : payment.amount}
                          onChange={(e) =>
                            updatePaymentSchedule(
                              "postPlacement",
                              index,
                              "amount",
                              e.target.value
                            )
                          }
                          className="text-xs h-8"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            removePaymentRow(index, "postPlacement")
                          }
                          className="h-8 px-2"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addPaymentRow("postPlacement")}
                    className="mt-2"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Payment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  const getStepCount = () => {
    return clientData.clientStatus === "Placed" ? 4 : 3;
  };

  return (
    <div className="p-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-3xl font-semibold text-[#682A53]">
              Create New Client
            </h1>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Horizontal Dashboard Layout */}
        <div className="space-y-6">
          {/* Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Card 1: Basic Information */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#682A53] rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle className="text-base">Basic Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="clientName">Client Name *</Label>
                    <Input
                      id="clientName"
                      value={clientData.clientName}
                      onChange={(e) =>
                        handleInputChange("clientName", e.target.value)
                      }
                      className={errors.clientName ? "border-red-500" : ""}
                    />
                    {errors.clientName && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.clientName}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="enrollmentDate">Enrollment Date *</Label>
                    <Input
                      id="enrollmentDate"
                      type="date"
                      value={formatDateForInput(clientData.enrollmentDate)}
                      onChange={(e) =>
                        handleInputChange("enrollmentDate", e.target.value)
                      }
                      className={errors.enrollmentDate ? "border-red-500" : ""}
                    />
                    {errors.enrollmentDate && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.enrollmentDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="techStack">Tech Stack *</Label>
                    <Input
                      id="techStack"
                      value={clientData.techStack || ""}
                      onChange={(e) =>
                        handleInputChange("techStack", e.target.value)
                      }
                      placeholder="e.g., React, Node.js, TypeScript"
                      className={errors.techStack ? "border-red-500" : ""}
                    />
                    {errors.techStack && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.techStack}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="visaStatus">Visa Status *</Label>
                    <Input
                      id="visaStatus"
                      value={clientData.visaStatus || ""}
                      onChange={(e) =>
                        handleInputChange("visaStatus", e.target.value)
                      }
                      className={errors.visaStatus ? "border-red-500" : ""}
                    />
                    {errors.visaStatus && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.visaStatus}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="personalPhoneNumber">Phone Number *</Label>
                    <Input
                      id="personalPhoneNumber"
                      value={clientData.personalPhoneNumber || ""}
                      onChange={(e) =>
                        handleInputChange("personalPhoneNumber", e.target.value)
                      }
                      className={
                        errors.personalPhoneNumber ? "border-red-500" : ""
                      }
                    />
                    {errors.personalPhoneNumber && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.personalPhoneNumber}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="personalEmailAddress">
                      Email Address *
                    </Label>
                    <Input
                      id="personalEmailAddress"
                      type="email"
                      value={clientData.personalEmailAddress || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "personalEmailAddress",
                          e.target.value
                        )
                      }
                      className={
                        errors.personalEmailAddress ? "border-red-500" : ""
                      }
                    />
                    {errors.personalEmailAddress && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.personalEmailAddress}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="linkedInURL">LinkedIn URL</Label>
                    <Input
                      id="linkedInURL"
                      value={clientData.linkedInURL || ""}
                      onChange={(e) =>
                        handleInputChange("linkedInURL", e.target.value)
                      }
                      className={errors.linkedInURL ? "border-red-500" : ""}
                    />
                    {errors.linkedInURL && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.linkedInURL}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Marketing & Assignment */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#682A53] rounded-full flex items-center justify-center">
                    <Mail className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle className="text-base">
                    Marketing & Assignment
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="marketingStartDate">
                      Marketing Start Date
                    </Label>
                    <Input
                      id="marketingStartDate"
                      type="date"
                      value={formatDateForInput(clientData.marketingStartDate)}
                      onChange={(e) =>
                        handleInputChange("marketingStartDate", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="marketingEndDate">Marketing End Date</Label>
                    <Input
                      id="marketingEndDate"
                      type="date"
                      value={formatDateForInput(clientData.marketingEndDate)}
                      onChange={(e) =>
                        handleInputChange("marketingEndDate", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="marketingEmailID">Marketing Email ID</Label>
                    <Input
                      id="marketingEmailID"
                      value={clientData.marketingEmailID || ""}
                      onChange={(e) =>
                        handleInputChange("marketingEmailID", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="marketingEmailPassword">
                      Marketing Email Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="marketingEmailPassword"
                        type={showPassword ? "text" : "password"}
                        value={clientData.marketingEmailPassword || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "marketingEmailPassword",
                            e.target.value
                          )
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="assignedRecruiterID">
                      Assigned Recruiter
                    </Label>
                    <Select
                      value={clientData.assignedRecruiterID?.toString() || ""}
                      onValueChange={(value) =>
                        handleInputChange("assignedRecruiterID", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select recruiter" />
                      </SelectTrigger>
                      <SelectContent>
                        {recruiters.map((recruiter) => (
                          <SelectItem
                            key={recruiter.employeeID}
                            value={recruiter.employeeID.toString()}
                          >
                            {recruiter.firstName} {recruiter.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="assignedSalesPersonID">
                      Assigned Sales Person *
                    </Label>
                    <Select
                      value={clientData.assignedSalesPersonID?.toString() || ""}
                      onValueChange={(value) =>
                        handleInputChange("assignedSalesPersonID", value)
                      }
                    >
                      <SelectTrigger
                        className={
                          errors.assignedSalesPerson ? "border-red-500" : ""
                        }
                      >
                        <SelectValue placeholder="Select sales person" />
                      </SelectTrigger>
                      <SelectContent>
                        {salesPersons.map((salesPerson) => (
                          <SelectItem
                            key={salesPerson.employeeID}
                            value={salesPerson.employeeID.toString()}
                          >
                            {salesPerson.firstName} {salesPerson.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.assignedSalesPerson && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.assignedSalesPerson}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="clientStatus">Client Status *</Label>
                    <Select
                      value={clientData.clientStatus}
                      onValueChange={(value) =>
                        handleInputChange("clientStatus", value)
                      }
                    >
                      <SelectTrigger
                        className={errors.clientStatus ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Placed">Placed</SelectItem>
                        <SelectItem value="Backed Out">Backed Out</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.clientStatus && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.clientStatus}
                      </p>
                    )}
                  </div>

                  {clientData.clientStatus === "Backed Out" && (
                    <>
                      <div>
                        <Label htmlFor="backedOutDate">Backed Out Date</Label>
                        <Input
                          id="backedOutDate"
                          type="date"
                          value={formatDateForInput(clientData.backedOutDate)}
                          onChange={(e) =>
                            handleInputChange("backedOutDate", e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="backedOutReason">
                          Backed Out Reason
                        </Label>
                        <Textarea
                          id="backedOutReason"
                          value={clientData.backedOutReason || ""}
                          onChange={(e) =>
                            handleInputChange("backedOutReason", e.target.value)
                          }
                        />
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Card 3: Subscription */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#682A53] rounded-full flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle className="text-base">Subscription</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="subscriptionPlanName">
                      Subscription Plan Name *
                    </Label>
                    <Input
                      id="subscriptionPlanName"
                      value={clientData.subscriptionPlan?.planName || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "subscriptionPlan.planName",
                          e.target.value
                        )
                      }
                      className={
                        errors.subscriptionPlanName ? "border-red-500" : ""
                      }
                    />
                    {errors.subscriptionPlanName && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.subscriptionPlanName}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="subscriptionPlanPaymentStartDate">
                      Payment Start Date
                    </Label>
                    <Input
                      id="subscriptionPlanPaymentStartDate"
                      type="date"
                      value={formatDateForInput(
                        clientData.subscriptionPlan
                          ?.subscriptionPlanPaymentStartDate || null
                      )}
                      onChange={(e) =>
                        handleInputChange(
                          "subscriptionPlan.subscriptionPlanPaymentStartDate",
                          e.target.value
                        )
                      }
                      readOnly
                    />
                  </div>

                  <div>
                    <Label htmlFor="totalSubscriptionAmount">
                      Total Subscription Amount
                    </Label>
                    <Input
                      id="totalSubscriptionAmount"
                      type="number"
                      value={
                        clientData.subscriptionPlan?.totalSubscriptionAmount ||
                        ""
                      }
                      onChange={(e) =>
                        handleInputChange(
                          "subscriptionPlan.totalSubscriptionAmount",
                          e.target.value
                        )
                      }
                      readOnly
                    />
                  </div>

                  <div>
                    <Label htmlFor="serviceAgreement">
                      Service Agreement *
                    </Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Input
                          id="serviceAgreement"
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setServiceAgreementFile(file);
                              setServiceAgreementFileName(file.name);
                            }
                          }}
                          className={
                            errors.serviceAgreement ? "border-red-500" : ""
                          }
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            document.getElementById("serviceAgreement")?.click()
                          }
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Browse
                        </Button>
                      </div>
                      {serviceAgreementFileName && (
                        <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded border">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-700">
                            {serviceAgreementFileName}
                          </span>
                        </div>
                      )}
                    </div>
                    {errors.serviceAgreement && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.serviceAgreement}
                      </p>
                    )}
                  </div>

                  {/* Payment Schedule */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <Label>Payment Schedule</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addPaymentRow("subscription")}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Payment
                      </Button>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {subscriptionPaymentSchedule.map((payment, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-3 gap-2 p-2 bg-gray-50 rounded"
                        >
                          <Input
                            type="date"
                            value={formatDateForInput(payment.paymentDate)}
                            onChange={(e) =>
                              updatePaymentSchedule(
                                "subscription",
                                index,
                                "paymentDate",
                                e.target.value
                              )
                            }
                            className="text-xs h-8"
                          />
                          <Input
                            type="number"
                            placeholder="Amount"
                            value={payment.amount || ""}
                            onChange={(e) =>
                              updatePaymentSchedule(
                                "subscription",
                                index,
                                "amount",
                                e.target.value
                              )
                            }
                            className="text-xs h-8"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              removePaymentRow(index, "subscription")
                            }
                            className="h-8 px-2"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end mt-8">
            <div className="flex space-x-4">
              <Button type="button" variant="outline" onClick={handleBack}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-[#682A53] hover:bg-[#682A53]/90 text-white"
              >
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Client
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
