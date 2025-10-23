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
  PaymentSchedule,
} from "../../types/Clients/Client";
import { useAuth } from "../../../contexts/authContext";
import { useLoading } from "../../../contexts/loadingContext";
import permissions from "../../utils/permissions";
import {
  getRecruiters,
  getSalesPersons,
} from "../../employees/actions/employeeActions";
import { Recruiter } from "../../types/employees/recruiter";
import { formatDateForInput, parseDateForState } from "../../utils/dateUtils";
import { PLAN_TEMPLATES, generatePlanName, getPlanDetails } from "../constants/subscriptionPlans";


export default function CreateClientForm() {
  const router = useRouter();
  const { roles } = useAuth();
  const { withLoading } = useLoading();
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [salesPersons, setSalesPersons] = useState<Recruiter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [serviceAgreementFile, setServiceAgreementFile] = useState<File | null>(
    null
  );
  const [serviceAgreementFileName, setServiceAgreementFileName] =
    useState<string>("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const initialClientData: Client = {
    clientID: 0,
    clientName: "",
    enrollmentDate: null,
    clientStatus: "sales", // Default status, will be controlled by backend
    techStack: "",
    personalPhoneNumber: "",
    personalEmailAddress: "",
    assignedRecruiterID: null,
    assignedRecruiterName: "",
    assignedSalesPersonID: null,
    assignedSalesPersonName: "",
    visaStatus: "",
    linkedInURL: "",
    subscriptionPlanID: null,
    totalDue: 0.0,
    totalPaid: 0.0,
    postPlacementPlanID: null,
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
    marketingStartDate: null,
    marketingEndDate: null,
    marketingEmailID: "",
    marketingEmailPassword: "",
  };

  const [clientData, setClientData] = useState<Client>(initialClientData);
  const [subscriptionPaymentSchedule, setSubscriptionPaymentSchedule] =
    useState<PaymentSchedule[]>([]);

  // Plan template states
  const [planTemplate, setPlanTemplate] = useState<string>("");
  const [customMonthlyAmount, setCustomMonthlyAmount] = useState<number>(0);
  const [customDurationMonths, setCustomDurationMonths] = useState<number>(0);
  const [customPercentageAfterJob, setCustomPercentageAfterJob] = useState<number>(0);

  // Handle plan template selection
  const handlePlanTemplateChange = (template: string) => {
    setPlanTemplate(template);

    if (template === "Custom") {
      // Reset custom fields but keep plan name editable
      setCustomMonthlyAmount(0);
      setCustomDurationMonths(0);
      setCustomPercentageAfterJob(0);
      handleInputChange("subscriptionPlan.planName", "");
    } else if (template) {
      // Auto-generate plan name for predefined templates using utility function
      const planName = generatePlanName(template);
      handleInputChange("subscriptionPlan.planName", planName);
    } else {
      // No template selected
      handleInputChange("subscriptionPlan.planName", "");
    }
  };

  // Generate payment schedule based on template
  const generatePaymentSchedule = () => {
    const startDate = clientData.subscriptionPlan?.subscriptionPlanPaymentStartDate;
    if (!startDate) {
      alert("Please select a payment start date first");
      return;
    }

    if (!planTemplate) {
      alert("Please select a plan template");
      return;
    }

    // Get plan details using utility function
    const planDetails = getPlanDetails(
      planTemplate,
      customMonthlyAmount,
      customDurationMonths,
      customPercentageAfterJob
    );

    if (!planDetails) {
      alert("Please fill in all custom plan fields");
      return;
    }

    // Update plan name using utility function
    const planName = generatePlanName(
      planTemplate,
      customMonthlyAmount,
      customDurationMonths,
      customPercentageAfterJob
    );
    handleInputChange("subscriptionPlan.planName", planName);

    // Generate payment schedule
    const payments: PaymentSchedule[] = [];
    const startDateObj = new Date(startDate + 'T12:00:00'); // Parse at noon to avoid timezone issues

    for (let i = 0; i < planDetails.durationMonths; i++) {
      const paymentDate = new Date(startDateObj);
      paymentDate.setMonth(paymentDate.getMonth() + i);

      // Keep as string in YYYY-MM-DD format
      const paymentDateStr = paymentDate.toISOString().split("T")[0];

      payments.push({
        paymentDate: paymentDateStr as any, // Keep as string
        originalAmount: planDetails.monthlyAmount,
        paidAmount: 0,
        remainingAmount: planDetails.monthlyAmount,
        dueDate: paymentDateStr as any, // Keep as string
        paymentType: "Subscription",
        paymentStatus: "Pending",
        assignedTo: null,
        paymentScheduleID: 0,
        clientID: 0,
        subscriptionPlanID: null,
        postPlacementPlanID: null,
        createdTS: null,
        createdBy: null,
        updatedTS: null,
        updatedBy: null,
      });
    }

    setSubscriptionPaymentSchedule(payments);
  };

  // Clear payment schedule
  const clearPaymentSchedule = () => {
    setSubscriptionPaymentSchedule([]);
  };

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
      (sum, payment) => sum + (payment.originalAmount || 0),
      0
    );

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

    setClientData((prevData) => ({
      ...prevData,
      totalDue,
      totalPaid: 0,
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
      ],
    }));
  }, [subscriptionPaymentSchedule]);

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
              // Keep date strings as strings, don't convert to Date objects
              [fieldName]: fieldName.includes("Date")
                ? (value || null)
                : value,
            },
          };
        }
        return prevData;
      });
    } else {
      // Keep date strings as strings, don't convert to Date objects
      const newValue = field.includes("Date")
        ? (value || null)
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
    field: "serviceAgreement",
    file: File | null
  ) => {
    setServiceAgreementFile(file);
    setServiceAgreementFileName(file ? file.name : "");
  };

  const addPaymentRow = () => {
    const newPayment: PaymentSchedule = {
      paymentDate: null,
      originalAmount: 0,
      paidAmount: 0,
      remainingAmount: 0,
      dueDate: null,
      paymentType: "Subscription",
      paymentStatus: "Pending",
      assignedTo: null,
      paymentScheduleID: 0,
      clientID: 0,
      subscriptionPlanID: null,
      postPlacementPlanID: null,
      createdTS: null,
      createdBy: null,
      updatedTS: null,
      updatedBy: null,
    };

    setSubscriptionPaymentSchedule([
      ...subscriptionPaymentSchedule,
      newPayment,
    ]);
  };

  const removePaymentRow = (index: number) => {
    setSubscriptionPaymentSchedule(
      subscriptionPaymentSchedule.filter((_, i) => i !== index)
    );
  };

  const updatePaymentSchedule = (
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
                field === "paymentDate" || field === "dueDate"
                  ? (value || null) // Keep as string, don't convert to Date
                  : field === "originalAmount" || field === "paidAmount" || field === "remainingAmount"
                  ? Number(value)
                  : value,
            }
          : payment
      );

    setSubscriptionPaymentSchedule(updater(subscriptionPaymentSchedule));
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Basic Information validation
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

    // Assignment validation
    if (!clientData.assignedSalesPersonID) {
      newErrors.assignedSalesPerson = "Assigned sales person is required";
    }

    // Subscription validation
    if (!clientData.subscriptionPlan?.planName?.trim()) {
      newErrors.subscriptionPlanName = "Subscription plan name is required";
    }
    if (!serviceAgreementFile) {
      newErrors.serviceAgreement = "Service agreement is required";
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


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const submitData: Client = {
        ...clientData,
        // Dates are already strings from the form, keep them as is
        enrollmentDate: clientData.enrollmentDate,
        placedDate: clientData.placedDate,
        backedOutDate: clientData.backedOutDate,
        postPlacementPlan: null,
        postPlacementPlanID: null,
        paymentSchedules: subscriptionPaymentSchedule.map((ps) => ({
          ...ps,
          paymentScheduleID: 0,
          clientID: 0,
          createdTS: null,
          createdBy: null,
          updatedTS: null,
          updatedBy: null,
        })),
      };

      const success = await withLoading(
        createClient(submitData, serviceAgreementFile, null)
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



  return (
    <div className="flex flex-col h-screen">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-gray-50 border-b shadow-sm">
        {/* Header - Compact */}
        <div className="bg-white px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#682A53] rounded-full flex items-center justify-center">
              <Plus className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-[#682A53]">
                Create New Client
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto">
      <form onSubmit={handleSubmit} className="client-form p-4">
        {/* Horizontal Dashboard Layout */}
        <div className="space-y-4">
          {/* Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Subscription */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#682A53] rounded-full flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle className="text-base">
                    Subscription
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-6">
                  {/* Plan Details */}
                  <div className="space-y-4">
                    {/* Plan Template Selection */}
                    <div>
                      <Label
                        htmlFor="planTemplate"
                        className="text-sm font-medium text-gray-700"
                      >
                        Plan Template *
                      </Label>
                      <Select
                        value={planTemplate}
                        onValueChange={handlePlanTemplateChange}
                      >
                        <SelectTrigger className="mt-1 h-11 border-gray-200 focus:border-[#682A53] focus:ring-[#682A53]/20">
                          <SelectValue placeholder="Select a plan template" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Basic">
                            Basic Plan - $500/month × 3 months (14% after job)
                          </SelectItem>
                          <SelectItem value="Standard">
                            Standard Plan - $1000/month × 3 months (12% after job)
                          </SelectItem>
                          <SelectItem value="Premium">
                            Premium Plan - $1299/month × 3 months (10% after job)
                          </SelectItem>
                          <SelectItem value="Custom">
                            Custom Plan
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Custom Plan Fields - Only show when Custom is selected */}
                    {planTemplate === "Custom" && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm font-semibold text-blue-900">
                            Custom Plan Configuration
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label
                              htmlFor="customMonthlyAmount"
                              className="text-sm font-medium text-gray-700"
                            >
                              Monthly Amount ($)
                            </Label>
                            <div className="relative mt-1">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-sm">
                                $
                              </span>
                              <Input
                                id="customMonthlyAmount"
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={customMonthlyAmount || ""}
                                onChange={(e) =>
                                  setCustomMonthlyAmount(parseFloat(e.target.value) || 0)
                                }
                                className="h-11 pl-8 border-gray-200 focus:border-[#682A53] focus:ring-[#682A53]/20"
                                placeholder="0.00"
                              />
                            </div>
                          </div>
                          <div>
                            <Label
                              htmlFor="customDurationMonths"
                              className="text-sm font-medium text-gray-700"
                            >
                              Duration (Months)
                            </Label>
                            <Input
                              id="customDurationMonths"
                              type="number"
                              min="1"
                              value={customDurationMonths || ""}
                              onChange={(e) =>
                                setCustomDurationMonths(parseInt(e.target.value) || 0)
                              }
                              className="mt-1 h-11 border-gray-200 focus:border-[#682A53] focus:ring-[#682A53]/20"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <Label
                              htmlFor="customPercentageAfterJob"
                              className="text-sm font-medium text-gray-700"
                            >
                              % After Job
                            </Label>
                            <div className="relative mt-1">
                              <Input
                                id="customPercentageAfterJob"
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                value={customPercentageAfterJob || ""}
                                onChange={(e) =>
                                  setCustomPercentageAfterJob(parseFloat(e.target.value) || 0)
                                }
                                className="h-11 pr-8 border-gray-200 focus:border-[#682A53] focus:ring-[#682A53]/20"
                                placeholder="0"
                              />
                              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-sm">
                                %
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Plan Name - Auto-filled, read-only */}
                    <div>
                      <Label
                        htmlFor="subscriptionPlanName"
                        className="text-sm font-medium text-gray-700"
                      >
                        Plan Name *
                        <span className="text-xs text-gray-500 ml-1">
                          (auto-generated from template)
                        </span>
                      </Label>
                      <Input
                        id="subscriptionPlanName"
                        value={clientData.subscriptionPlan?.planName || ""}
                        readOnly
                        className="mt-1 h-11 border-gray-200 bg-gray-50 cursor-not-allowed"
                        placeholder="Select a plan template to auto-fill"
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
                        <Label
                          htmlFor="subscriptionPlanPaymentStartDate"
                          className="text-sm font-medium text-gray-700"
                        >
                          Payment Start Date *
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
                          className="mt-1 h-11 border-gray-200 focus:border-[#682A53] focus:ring-[#682A53]/20"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="totalSubscriptionAmount"
                          className="text-sm font-medium text-gray-700"
                        >
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
                              (sum, payment) => sum + (payment.originalAmount || 0),
                              0
                            )}
                            disabled={true}
                            className="h-11 pl-8 bg-gray-50 border-gray-200"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Generate and Clear Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 w-full">
                      <Button
                        type="button"
                        onClick={generatePaymentSchedule}
                        className="w-full sm:flex-1 bg-[#682A53] hover:bg-[#682A53]/90 text-white h-11 text-xs sm:text-sm whitespace-nowrap"
                      >
                        <Plus className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span className="hidden sm:inline">Generate Schedule</span>
                        <span className="sm:hidden">Generate</span>
                      </Button>
                      <Button
                        type="button"
                        onClick={clearPaymentSchedule}
                        variant="outline"
                        className="w-full sm:w-auto border-red-500 text-red-600 hover:bg-red-50 h-11 text-xs sm:text-sm px-4 whitespace-nowrap"
                        disabled={subscriptionPaymentSchedule.length === 0}
                      >
                        <Trash2 className="h-4 w-4 mr-1 flex-shrink-0" />
                        Clear
                      </Button>
                    </div>
                  </div>

                  {/* Service Agreement */}
                  <div>
                    <Label
                      htmlFor="serviceAgreement"
                      className="text-sm font-medium text-gray-700"
                    >
                      Service Agreement *
                    </Label>
                    <div className="space-y-3 mt-2">
                      <div className="flex items-center space-x-2">
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
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            document
                              .getElementById("serviceAgreement")
                              ?.click()
                          }
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Browse
                        </Button>
                      </div>
                      {serviceAgreementFileName && (
                        <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <FileText className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium text-blue-700">
                            Selected: {serviceAgreementFileName}
                          </span>
                        </div>
                      )}
                      {!serviceAgreementFileName && (
                        <p className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded-lg">
                          No service agreement uploaded
                        </p>
                      )}
                    </div>
                    {errors.serviceAgreement && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.serviceAgreement}
                      </p>
                    )}
                  </div>

                  {/* Payment Schedule */}
                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <Label className="text-lg font-semibold text-gray-900">
                          Payment Schedule
                        </Label>
                        <p className="text-sm text-gray-500 mt-1">
                          {subscriptionPaymentSchedule.length === 0
                            ? "No payments added yet"
                            : `${subscriptionPaymentSchedule.length} payment${
                                subscriptionPaymentSchedule.length > 1
                                  ? "s"
                                  : ""
                              } scheduled`}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="default"
                        size="sm"
                        onClick={addPaymentRow}
                        className="bg-[#682A53] hover:bg-[#682A53]/90 text-white shadow-sm"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Payment
                      </Button>
                    </div>

                    {subscriptionPaymentSchedule.length === 0 ? (
                      <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                        <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-sm font-medium text-gray-900 mb-2">
                          No payment schedule yet
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                          Add payments to create a schedule for this
                          subscription plan.
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addPaymentRow}
                          className="border-[#682A53] text-[#682A53] hover:bg-[#682A53] hover:text-white"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Payment
                        </Button>
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
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removePaymentRow(index)}
                              className="absolute -top-3 -right-3 w-7 h-7 p-0 bg-red-500 text-white hover:bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md z-10"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>

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
                                      e.target.value
                                    )
                                  }
                                  className="h-11 border-gray-200 focus:border-[#682A53] focus:ring-[#682A53]/20"
                                />
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
                                    value={payment.originalAmount || ""}
                                    onChange={(e) => {
                                      const value = parseFloat(e.target.value);
                                      if (
                                        value < 0.01 &&
                                        e.target.value !== ""
                                      ) {
                                        return; // Prevent negative values and values less than 0.01
                                      }
                                      updatePaymentSchedule(
                                        index,
                                        "originalAmount",
                                        e.target.value
                                      );
                                    }}
                                    className="h-11 pl-8 border-gray-200 focus:border-[#682A53] focus:ring-[#682A53]/20"
                                  />
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


          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-8 pb-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[#682A53] hover:bg-[#682A53]/90 text-white w-full sm:w-auto"
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Client
            </Button>
          </div>
        </div>
      </form>
      </div>
    </div>
  );
}
