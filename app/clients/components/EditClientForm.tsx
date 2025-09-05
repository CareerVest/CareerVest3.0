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
// Dialog imports removed - now using direct editing
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
  Plus,
  Trash2,
  Upload,
  Eye,
  EyeOff,
  ExternalLink,
  User,
  Mail,
  CreditCard,
  FileText,
  Edit,
} from "lucide-react";
import { updateClient } from "../actions/clientActions";
import type {
  ClientDetail,
  PaymentSchedule,
} from "../../types/Clients/ClientDetail";
import { useAuth } from "../../../contexts/authContext";
import permissions from "../../utils/permissions";
import {
  getRecruiters,
  getSalesPersons,
} from "../../employees/actions/employeeActions";
import { Recruiter } from "../../types/employees/recruiter";
import { formatDateForInput, parseDateForState } from "../../utils/dateUtils";

interface EditClientFormProps {
  client: ClientDetail;
  userRole: string;
  permissions: any;
  canEdit: boolean;
}

export default function EditClientForm({
  client,
  userRole,
  permissions,
  canEdit,
}: EditClientFormProps) {
  const router = useRouter();
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
  const [subscriptionPaymentSchedule, setSubscriptionPaymentSchedule] =
    useState<PaymentSchedule[]>([]);
  const [postPlacementPaymentSchedule, setPostPlacementPaymentSchedule] =
    useState<PaymentSchedule[]>([]);
  const [showAllSubscriptionPayments, setShowAllSubscriptionPayments] =
    useState(false);
  const [showAllPostPlacementPayments, setShowAllPostPlacementPayments] =
    useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const initialClientData: ClientDetail = {
    ...client,
    enrollmentDate: client.enrollmentDate
      ? new Date(client.enrollmentDate)
      : null,
    marketingStartDate: client.marketingStartDate
      ? new Date(client.marketingStartDate)
      : null,
    marketingEndDate: client.marketingEndDate
      ? new Date(client.marketingEndDate)
      : null,
    placedDate: client.placedDate ? new Date(client.placedDate) : null,
    backedOutDate: client.backedOutDate ? new Date(client.backedOutDate) : null,
  };

  const [clientData, setClientData] = useState<ClientDetail>(initialClientData);

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
    // Separate subscription and post-placement payment schedules
    const subscriptionPayments =
      client.paymentSchedules?.filter(
        (p) => p.paymentType === "Subscription"
      ) || [];
    const postPlacementPayments =
      client.paymentSchedules?.filter(
        (p) => p.paymentType === "PostPlacement"
      ) || [];

    setSubscriptionPaymentSchedule(subscriptionPayments);
    setPostPlacementPaymentSchedule(postPlacementPayments);
  }, [client.paymentSchedules]);

  // Auto-populate payment start dates from first payment in schedule
  useEffect(() => {
    if (subscriptionPaymentSchedule.length > 0) {
      const firstPaymentDate = subscriptionPaymentSchedule
        .filter(p => p.paymentDate)
        .sort((a, b) => new Date(a.paymentDate!).getTime() - new Date(b.paymentDate!).getTime())[0]?.paymentDate;
      
      if (firstPaymentDate && !clientData.subscriptionPlan?.subscriptionPlanPaymentStartDate) {
        // Format the date properly - handle both Date objects and strings
        const formattedDate = firstPaymentDate instanceof Date 
          ? formatDateForInput(firstPaymentDate)
          : (typeof firstPaymentDate === 'string' && firstPaymentDate.includes('T') 
              ? formatDateForInput(new Date(firstPaymentDate))
              : firstPaymentDate);
        handleInputChange(
          "subscriptionPlan.subscriptionPlanPaymentStartDate",
          formattedDate
        );
      }
    }
  }, [subscriptionPaymentSchedule, clientData.subscriptionPlan?.subscriptionPlanPaymentStartDate]);

  useEffect(() => {
    if (postPlacementPaymentSchedule.length > 0) {
      const firstPaymentDate = postPlacementPaymentSchedule
        .filter(p => p.paymentDate)
        .sort((a, b) => new Date(a.paymentDate!).getTime() - new Date(b.paymentDate!).getTime())[0]?.paymentDate;
      
      if (firstPaymentDate && !clientData.postPlacementPlan?.postPlacementPlanPaymentStartDate) {
        // Format the date properly - handle both Date objects and strings
        const formattedDate = firstPaymentDate instanceof Date 
          ? formatDateForInput(firstPaymentDate)
          : (typeof firstPaymentDate === 'string' && firstPaymentDate.includes('T') 
              ? formatDateForInput(new Date(firstPaymentDate))
              : firstPaymentDate);
        handleInputChange(
          "postPlacementPlan.postPlacementPlanPaymentStartDate",
          formattedDate
        );
      }
    }
  }, [postPlacementPaymentSchedule, clientData.postPlacementPlan?.postPlacementPlanPaymentStartDate]);

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
      clientID: client.clientID,
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
    index: number,
    field: keyof PaymentSchedule,
    value: string | number,
    type: "subscription" | "postPlacement"
  ) => {
    // Clear errors when user starts typing
    const errorKey = `${type}Payment_${index}_${field === "paymentDate" ? "date" : "amount"}`;
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }

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
    } else if (type === "postPlacement") {
      setPostPlacementPaymentSchedule(updater(postPlacementPaymentSchedule));
    }
  };

  const validateFinancialData = () => {
    const newErrors: Record<string, string> = {};

    // Subscription validation
    if (subscriptionPaymentSchedule.length > 0) {
      subscriptionPaymentSchedule.forEach((payment, index) => {
        if (!payment.paymentDate) {
          newErrors[`subscriptionPayment_${index}_date`] = "Payment date is required";
        }
        if (!payment.amount || payment.amount <= 0) {
          newErrors[`subscriptionPayment_${index}_amount`] = "Payment amount must be greater than 0";
        }
        if (payment.amount && payment.amount > 1000000) {
          newErrors[`subscriptionPayment_${index}_amount`] = "Payment amount cannot exceed $1,000,000";
        }
      });

      // Check for duplicate payment dates in subscription
      const subscriptionDates = subscriptionPaymentSchedule.map(p => p.paymentDate).filter(Boolean);
      const duplicateSubscriptionDates = subscriptionDates.filter((date, index) => subscriptionDates.indexOf(date) !== index);
      if (duplicateSubscriptionDates.length > 0) {
        newErrors.subscriptionDuplicateDates = "Subscription payment schedule cannot have duplicate dates";
      }
    }

    // Post-placement validation
    if (postPlacementPaymentSchedule.length > 0) {
      postPlacementPaymentSchedule.forEach((payment, index) => {
        if (!payment.paymentDate) {
          newErrors[`postPlacementPayment_${index}_date`] = "Payment date is required";
        }
        if (!payment.amount || payment.amount <= 0) {
          newErrors[`postPlacementPayment_${index}_amount`] = "Payment amount must be greater than 0";
        }
        if (payment.amount && payment.amount > 1000000) {
          newErrors[`postPlacementPayment_${index}_amount`] = "Payment amount cannot exceed $1,000,000";
        }
      });

      // Check for duplicate payment dates in post-placement
      const postPlacementDates = postPlacementPaymentSchedule.map(p => p.paymentDate).filter(Boolean);
      const duplicatePostPlacementDates = postPlacementDates.filter((date, index) => postPlacementDates.indexOf(date) !== index);
      if (duplicatePostPlacementDates.length > 0) {
        newErrors.postPlacementDuplicateDates = "Post-placement payment schedule cannot have duplicate dates";
      }
    }

    // Plan name validation
    if (subscriptionPaymentSchedule.length > 0 && !clientData.subscriptionPlan?.planName?.trim()) {
      newErrors.subscriptionPlanName = "Subscription plan name is required when payments are scheduled";
    }

    if (postPlacementPaymentSchedule.length > 0 && !clientData.postPlacementPlan?.planName?.trim()) {
      newErrors.postPlacementPlanName = "Post-placement plan name is required when payments are scheduled";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate financial data
    if (!validateFinancialData()) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const hasPostPlacementData =
        clientData.postPlacementPlan?.planName?.trim() ||
        clientData.postPlacementPlan?.postPlacementPlanPaymentStartDate ||
        clientData.postPlacementPlan?.totalPostPlacementAmount ||
        postPlacementPaymentSchedule.length > 0;

      const submitData: ClientDetail = {
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
          paymentScheduleID: ps.paymentScheduleID || 0,
          clientID: client.clientID,
          createdTS: ps.createdTS || null,
          createdBy: ps.createdBy || null,
          updatedTS: ps.updatedTS || null,
          updatedBy: ps.updatedBy || null,
        })),
      };

      const success = await updateClient(
        client.clientID,
        submitData,
        serviceAgreementFile,
        promissoryNoteFile
      );
      if (success) {
        router.push(`/clients/${client.clientID}`);
      }
    } catch (error: any) {
      console.error("Error updating client:", error);
      alert(error.message || "Failed to update client");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    // Preserve search state when going back to client details
    const searchParams = new URLSearchParams(window.location.search);
    const search = searchParams.get("search");
    const backUrl = search
      ? `/clients/${client.clientID}?search=${search}`
      : `/clients/${client.clientID}`;
    router.push(backUrl);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  // Calculate totals for header (combined)
  const totalDue =
    client?.paymentSchedules?.reduce(
      (sum, payment) => sum + (payment.amount || 0),
      0
    ) || 0;

  const totalPaid =
    client?.paymentSchedules?.reduce(
      (sum, payment) => sum + (payment.isPaid ? payment.amount || 0 : 0),
      0
    ) || 0;

  // Calculate subscription-specific totals
  const subscriptionTotalDue = subscriptionPaymentSchedule.reduce(
    (sum, payment) => sum + (payment.amount || 0),
    0
  );

  const subscriptionTotalPaid = subscriptionPaymentSchedule.reduce(
    (sum, payment) => sum + (payment.isPaid ? payment.amount || 0 : 0),
    0
  );

  // Calculate post-placement-specific totals
  const postPlacementTotalDue = postPlacementPaymentSchedule.reduce(
    (sum, payment) => sum + (payment.amount || 0),
    0
  );

  const postPlacementTotalPaid = postPlacementPaymentSchedule.reduce(
    (sum, payment) => sum + (payment.isPaid ? payment.amount || 0 : 0),
    0
  );

  return (
    <div className="p-6 w-full">
      {/* Modern Header */}
      <div className="mb-8">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={handleBack}
            className="bg-[#682A53] hover:bg-[#682A53]/90 text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Client Details
          </Button>
        </div>

        {/* Client Info Header */}
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-[#682A53] rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Edit Client
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm text-gray-600">
                    {client.clientName}
                  </span>
                  <Badge
                    variant={
                      client.clientStatus === "Active" ? "success" : "default"
                    }
                    className="text-xs"
                  >
                    {client.clientStatus}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Total Due</div>
                  <div className="text-lg font-semibold text-[#682A53]">
                    {formatCurrency(totalDue)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Total Paid</div>
                  <div className="text-lg font-semibold text-green-600">
                    {formatCurrency(totalPaid)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="client-form">
        {/* Horizontal Dashboard Layout */}
        <div className="space-y-6">
          {/* Cards Grid */}
          <div
            className={`grid grid-cols-1 lg:grid-cols-${
              clientData.clientStatus === "Placed" ? "4" : "3"
            } gap-6`}
          >
            {/* Card 1: Basic Information */}
            <Card>
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
                    <Label htmlFor="clientName">Client Name</Label>
                    <Input
                      id="clientName"
                      value={clientData.clientName}
                      onChange={(e) =>
                        handleInputChange("clientName", e.target.value)
                      }
                      disabled={!canEdit}
                    />
                  </div>

                  <div>
                    <Label htmlFor="enrollmentDate">Enrollment Date</Label>
                    <Input
                      id="enrollmentDate"
                      type="date"
                      value={formatDateForInput(clientData.enrollmentDate)}
                      onChange={(e) =>
                        handleInputChange("enrollmentDate", e.target.value)
                      }
                      disabled={!canEdit}
                    />
                  </div>

                  <div>
                    <Label htmlFor="techStack">Tech Stack</Label>
                    <Input
                      id="techStack"
                      value={clientData.techStack || ""}
                      onChange={(e) =>
                        handleInputChange("techStack", e.target.value)
                      }
                      disabled={!canEdit}
                    />
                  </div>

                  <div>
                    <Label htmlFor="visaStatus">Visa Status</Label>
                    <Input
                      id="visaStatus"
                      value={clientData.visaStatus || ""}
                      onChange={(e) =>
                        handleInputChange("visaStatus", e.target.value)
                      }
                      disabled={!canEdit}
                    />
                  </div>

                  <div>
                    <Label htmlFor="personalPhoneNumber">Phone Number</Label>
                    <Input
                      id="personalPhoneNumber"
                      value={clientData.personalPhoneNumber || ""}
                      onChange={(e) =>
                        handleInputChange("personalPhoneNumber", e.target.value)
                      }
                      disabled={!canEdit}
                    />
                  </div>

                  <div>
                    <Label htmlFor="personalEmailAddress">Email Address</Label>
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
                      disabled={!canEdit}
                    />
                  </div>

                  <div>
                    <Label htmlFor="linkedInURL">LinkedIn URL</Label>
                    <Input
                      id="linkedInURL"
                      value={clientData.linkedInURL || ""}
                      onChange={(e) =>
                        handleInputChange("linkedInURL", e.target.value)
                      }
                      disabled={!canEdit}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Marketing & Assignment */}
            <Card>
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
                      disabled={!canEdit}
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
                      disabled={!canEdit}
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
                      disabled={!canEdit}
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
                        disabled={!canEdit}
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
                      disabled={!canEdit}
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
                      Assigned Sales Person
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
                      disabled={!canEdit}
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
                  </div>

                  <div>
                    <Label htmlFor="clientStatus">Client Status</Label>
                    <Select
                      value={clientData.clientStatus}
                      onValueChange={(value) =>
                        handleInputChange("clientStatus", value)
                      }
                      disabled={!canEdit}
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
                        disabled={!canEdit}
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
                          disabled={!canEdit}
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
                          disabled={!canEdit}
                        />
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Card 3: Subscription */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#682A53] rounded-full flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle className="text-base">Subscription</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-6">
                  {/* Plan Details */}
                  <div className="space-y-4">
                    {/* Plan Name - Full width */}
                    <div>
                      <Label htmlFor="subscriptionPlanName" className="text-sm font-medium text-gray-700">
                        Plan Name *
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
                        disabled={!canEdit}
                        className="mt-1 h-11 border-gray-200 focus:border-[#682A53] focus:ring-[#682A53]/20"
                        placeholder="Enter subscription plan name"
                      />
                      {errors.subscriptionPlanName && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.subscriptionPlanName}
                        </p>
                      )}
                    </div>

                    {/* Payment Start Date and Total Amount - Side by side */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="subscriptionPlanPaymentStartDate" className="text-sm font-medium text-gray-700">
                          Payment Start Date
                          <span className="text-xs text-gray-500 ml-1">(auto-filled from first payment)</span>
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
                          disabled={!canEdit}
                          className="mt-1 h-11 border-gray-200 focus:border-[#682A53] focus:ring-[#682A53]/20 bg-gray-50"
                          readOnly
                        />
                      </div>
                      <div>
                        <Label htmlFor="totalSubscriptionAmount" className="text-sm font-medium text-gray-700">
                          Total Amount
                        </Label>
                        <div className="relative mt-1">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-sm">
                            $
                          </span>
                          <Input
                            id="totalSubscriptionAmount"
                            type="number"
                            value={subscriptionPaymentSchedule.reduce(
                              (sum, payment) => sum + (payment.amount || 0),
                              0
                            )}
                            disabled={true}
                            className="h-11 pl-8 bg-gray-50 border-gray-200"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Service Agreement */}
                  <div>
                    <Label htmlFor="serviceAgreement" className="text-sm font-medium text-gray-700">
                      Service Agreement
                    </Label>
                    <div className="space-y-3 mt-2">
                      {canEdit && (
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
                            className="flex-1"
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
                      )}
                      {serviceAgreementFileName && (
                        <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <FileText className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium text-blue-700">
                            New: {serviceAgreementFileName}
                          </span>
                        </div>
                      )}
                      {client.serviceAgreementUrl && (
                        <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border">
                          <ExternalLink className="h-4 w-4 text-blue-500" />
                          <a
                            href={client.serviceAgreementUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-500 hover:underline font-medium"
                          >
                            View Current Service Agreement
                          </a>
                        </div>
                      )}
                      {!client.serviceAgreementUrl && !serviceAgreementFileName && (
                        <p className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded-lg">
                          No service agreement uploaded
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Payment Schedule */}
                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <Label className="text-lg font-semibold text-gray-900">Payment Schedule</Label>
                        <p className="text-sm text-gray-500 mt-1">
                          {subscriptionPaymentSchedule.length === 0 
                            ? "No payments added yet" 
                            : `${subscriptionPaymentSchedule.length} payment${subscriptionPaymentSchedule.length > 1 ? 's' : ''} scheduled`
                          }
                        </p>
                      </div>
                      {canEdit && (
                        <Button
                          type="button"
                          variant="default"
                          size="sm"
                          onClick={() => addPaymentRow("subscription")}
                          className="bg-[#682A53] hover:bg-[#682A53]/90 text-white shadow-sm"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Payment
                        </Button>
                      )}
                    </div>
                    
                    {subscriptionPaymentSchedule.length === 0 ? (
                      <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                        <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-sm font-medium text-gray-900 mb-2">No payment schedule yet</h3>
                        <p className="text-sm text-gray-500 mb-4">Add payments to create a schedule for this subscription plan.</p>
                        {canEdit && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addPaymentRow("subscription")}
                            className="border-[#682A53] text-[#682A53] hover:bg-[#682A53] hover:text-white"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add First Payment
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-80 overflow-y-auto px-3 py-3">
                        {subscriptionPaymentSchedule.map((payment, index) => (
                          <div
                            key={index}
                            className="group relative bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:border-[#682A53]/20 mt-3 mb-3"
                          >
                            {/* Payment Number Badge */}
                            <div className="absolute -top-3 -left-3 w-7 h-7 bg-[#682A53] text-white rounded-full flex items-center justify-center text-xs font-semibold shadow-md z-10">
                              {index + 1}
                            </div>
                            
                            {/* Delete Button */}
                            {canEdit && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removePaymentRow(index, "subscription")}
                                className="absolute -top-3 -right-3 w-7 h-7 p-0 bg-red-500 text-white hover:bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md z-10"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700 flex items-center">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                  Payment Date
                                </Label>
                                <Input
                                  type="date"
                                  value={formatDateForInput(payment.paymentDate)}
                                  onChange={(e) =>
                                    updatePaymentSchedule(
                                      index,
                                      "paymentDate",
                                      e.target.value,
                                      "subscription"
                                    )
                                  }
                                  disabled={!canEdit}
                                  className="h-11 border-gray-200 focus:border-[#682A53] focus:ring-[#682A53]/20"
                                />
                                {errors[`subscriptionPayment_${index}_date`] && (
                                  <p className="text-xs text-red-500 mt-1">
                                    {errors[`subscriptionPayment_${index}_date`]}
                                  </p>
                                )}
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700 flex items-center">
                                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                  Amount
                                </Label>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-sm">
                                    $
                                  </span>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    placeholder="0.00"
                                    value={payment.amount || ""}
                                    onChange={(e) => {
                                      const value = parseFloat(e.target.value);
                                      if (value < 0.01 && e.target.value !== "") {
                                        return; // Prevent negative values and values less than 0.01
                                      }
                                      updatePaymentSchedule(
                                        index,
                                        "amount",
                                        e.target.value,
                                        "subscription"
                                      )
                                    }}
                                    disabled={!canEdit}
                                    className="h-11 pl-8 border-gray-200 focus:border-[#682A53] focus:ring-[#682A53]/20"
                                  />
                                  {errors[`subscriptionPayment_${index}_amount`] && (
                                    <p className="text-xs text-red-500 mt-1">
                                      {errors[`subscriptionPayment_${index}_amount`]}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card 4: Post-Placement (only shown for placed clients) */}
            {clientData.clientStatus === "Placed" && (
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-[#682A53] rounded-full flex items-center justify-center">
                      <FileText className="h-4 w-4 text-white" />
                    </div>
                    <CardTitle className="text-base">
                      Post-Placement
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-6">
                    {/* Plan Details */}
                    <div className="space-y-4">
                      {/* Plan Name - Full width */}
                      <div>
                        <Label htmlFor="postPlacementPlanName" className="text-sm font-medium text-gray-700">
                          Plan Name
                        </Label>
                        <Input
                          id="postPlacementPlanName"
                          value={clientData.postPlacementPlan?.planName || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "postPlacementPlan.planName",
                              e.target.value
                            )
                          }
                          disabled={!canEdit}
                          className="mt-1 h-11 border-gray-200 focus:border-[#682A53] focus:ring-[#682A53]/20"
                          placeholder="Enter post-placement plan name"
                        />
                      </div>

                      {/* Payment Start Date and Total Amount - Side by side */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="postPlacementPlanPaymentStartDate" className="text-sm font-medium text-gray-700">
                            Payment Start Date
                            <span className="text-xs text-gray-500 ml-1">(auto-filled from first payment)</span>
                          </Label>
                          <Input
                            id="postPlacementPlanPaymentStartDate"
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
                            disabled={!canEdit}
                            className="mt-1 h-11 border-gray-200 focus:border-[#682A53] focus:ring-[#682A53]/20 bg-gray-50"
                            readOnly
                          />
                        </div>
                        <div>
                          <Label htmlFor="totalPostPlacementAmount" className="text-sm font-medium text-gray-700">
                            Total Amount
                          </Label>
                          <div className="relative mt-1">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-sm">
                              $
                            </span>
                            <Input
                              id="totalPostPlacementAmount"
                              type="number"
                              value={postPlacementPaymentSchedule.reduce(
                                (sum, payment) => sum + (payment.amount || 0),
                                0
                              )}
                              disabled={true}
                              className="h-11 pl-8 bg-gray-50 border-gray-200"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Promissory Note */}
                    <div>
                      <Label htmlFor="promissoryNote" className="text-sm font-medium text-gray-700">
                        Promissory Note
                      </Label>
                      <div className="space-y-3 mt-2">
                        {canEdit && (
                          <div className="flex items-center space-x-2">
                            <Input
                              id="promissoryNote"
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setPromissoryNoteFile(file);
                                  setPromissoryNoteFileName(file.name);
                                }
                              }}
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                document.getElementById("promissoryNote")?.click()
                              }
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Browse
                            </Button>
                          </div>
                        )}
                        {promissoryNoteFileName && (
                          <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <FileText className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-medium text-blue-700">
                              New: {promissoryNoteFileName}
                            </span>
                          </div>
                        )}
                        {client.promissoryNoteUrl && (
                          <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border">
                            <ExternalLink className="h-4 w-4 text-blue-500" />
                            <a
                              href={client.promissoryNoteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-500 hover:underline font-medium"
                            >
                              View Current Promissory Note
                            </a>
                          </div>
                        )}
                        {!client.promissoryNoteUrl && !promissoryNoteFileName && (
                          <p className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded-lg">
                            No promissory note uploaded
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Payment Schedule */}
                    <div className="border-t pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <Label className="text-lg font-semibold text-gray-900">Payment Schedule</Label>
                          <p className="text-sm text-gray-500 mt-1">
                            {postPlacementPaymentSchedule.length === 0 
                              ? "No payments added yet" 
                              : `${postPlacementPaymentSchedule.length} payment${postPlacementPaymentSchedule.length > 1 ? 's' : ''} scheduled`
                            }
                          </p>
                        </div>
                        {canEdit && (
                          <Button
                            type="button"
                            variant="default"
                            size="sm"
                            onClick={() => addPaymentRow("postPlacement")}
                            className="bg-[#682A53] hover:bg-[#682A53]/90 text-white shadow-sm"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Payment
                          </Button>
                        )}
                      </div>
                      
                      {postPlacementPaymentSchedule.length === 0 ? (
                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-sm font-medium text-gray-900 mb-2">No payment schedule yet</h3>
                          <p className="text-sm text-gray-500 mb-4">Add payments to create a schedule for this post-placement plan.</p>
                          {canEdit && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addPaymentRow("postPlacement")}
                              className="border-[#682A53] text-[#682A53] hover:bg-[#682A53] hover:text-white"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add First Payment
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-4 max-h-80 overflow-y-auto px-3 py-3">
                          {postPlacementPaymentSchedule.map((payment, index) => (
                            <div
                              key={index}
                              className="group relative bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:border-[#682A53]/20 mt-3 mb-3"
                            >
                              {/* Payment Number Badge */}
                              <div className="absolute -top-3 -left-3 w-7 h-7 bg-[#682A53] text-white rounded-full flex items-center justify-center text-xs font-semibold shadow-md z-10">
                                {index + 1}
                              </div>
                              
                              {/* Delete Button */}
                              {canEdit && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removePaymentRow(index, "postPlacement")}
                                  className="absolute -top-3 -right-3 w-7 h-7 p-0 bg-red-500 text-white hover:bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md z-10"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              )}

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium text-gray-700 flex items-center">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                    Payment Date
                                  </Label>
                                  <Input
                                    type="date"
                                    value={formatDateForInput(payment.paymentDate)}
                                    onChange={(e) =>
                                      updatePaymentSchedule(
                                        index,
                                        "paymentDate",
                                        e.target.value,
                                        "postPlacement"
                                      )
                                    }
                                    disabled={!canEdit}
                                    className="h-11 border-gray-200 focus:border-[#682A53] focus:ring-[#682A53]/20"
                                  />
                                  {errors[`postPlacementPayment_${index}_date`] && (
                                    <p className="text-xs text-red-500 mt-1">
                                      {errors[`postPlacementPayment_${index}_date`]}
                                    </p>
                                  )}
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium text-gray-700 flex items-center">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                    Amount
                                  </Label>
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-sm">
                                      $
                                    </span>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      min="0.01"
                                      placeholder="0.00"
                                      value={payment.amount || ""}
                                      onChange={(e) => {
                                        const value = parseFloat(e.target.value);
                                        if (value < 0.01 && e.target.value !== "") {
                                          return; // Prevent negative values and values less than 0.01
                                        }
                                        updatePaymentSchedule(
                                          index,
                                          "amount",
                                          e.target.value,
                                          "postPlacement"
                                        )
                                      }}
                                      disabled={!canEdit}
                                      className="h-11 pl-8 border-gray-200 focus:border-[#682A53] focus:ring-[#682A53]/20"
                                    />
                                    {errors[`postPlacementPayment_${index}_amount`] && (
                                      <p className="text-xs text-red-500 mt-1">
                                        {errors[`postPlacementPayment_${index}_amount`]}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end mt-8">
            <div className="flex space-x-4">
              <Button type="button" variant="outline" onClick={handleBack}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !canEdit}
                className="bg-[#682A53] hover:bg-[#682A53]/90 text-white"
              >
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Update Client
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
