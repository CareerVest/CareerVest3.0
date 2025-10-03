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
import permissions from "../../utils/permissions";
import {
  getRecruiters,
  getSalesPersons,
} from "../../employees/actions/employeeActions";
import { Recruiter } from "../../types/employees/recruiter";
import { formatDateForInput, parseDateForState } from "../../utils/dateUtils";


export default function CreateClientForm() {
  const router = useRouter();
  const { roles } = useAuth();
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

  // Auto-populate payment start dates from first payment in schedule
  useEffect(() => {
    if (subscriptionPaymentSchedule.length > 0) {
      const firstPaymentDate = subscriptionPaymentSchedule
        .filter(p => p.paymentDate)
        .sort((a, b) => new Date(a.paymentDate!).getTime() - new Date(b.paymentDate!).getTime())[0]?.paymentDate;
      
      if (firstPaymentDate && !clientData.subscriptionPlan?.subscriptionPlanPaymentStartDate) {
        handleInputChange(
          "subscriptionPlan.subscriptionPlanPaymentStartDate",
          firstPaymentDate
        );
      }
    }
  }, [subscriptionPaymentSchedule, clientData.subscriptionPlan?.subscriptionPlanPaymentStartDate]);


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
    field: "serviceAgreement",
    file: File | null
  ) => {
    setServiceAgreementFile(file);
    setServiceAgreementFileName(file ? file.name : "");
  };

  const addPaymentRow = () => {
    const newPayment: PaymentSchedule = {
      paymentDate: null,
      amount: 0,
      paymentType: "Subscription",
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
                field === "paymentDate"
                  ? parseDateForState(value as string)
                  : field === "amount"
                  ? Number(value)
                  : value,
            }
          : payment
      );

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
        enrollmentDate: clientData.enrollmentDate
          ? new Date(clientData.enrollmentDate)
          : null,
        placedDate: clientData.placedDate
          ? new Date(clientData.placedDate)
          : null,
        backedOutDate: clientData.backedOutDate
          ? new Date(clientData.backedOutDate)
          : null,
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

      const success = await createClient(
        submitData,
        serviceAgreementFile,
        null
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

      <form onSubmit={handleSubmit} className="client-form">
        {/* Horizontal Dashboard Layout */}
        <div className="space-y-6">
          {/* Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    {/* Plan Name - Full width */}
                    <div>
                      <Label
                        htmlFor="subscriptionPlanName"
                        className="text-sm font-medium text-gray-700"
                      >
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
                        className={
                          errors.subscriptionPlanName ? "border-red-500 mt-1 h-11 border-gray-200 focus:border-[#682A53] focus:ring-[#682A53]/20" : "mt-1 h-11 border-gray-200 focus:border-[#682A53] focus:ring-[#682A53]/20"
                        }
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
                        <Label
                          htmlFor="subscriptionPlanPaymentStartDate"
                          className="text-sm font-medium text-gray-700"
                        >
                          Payment Start Date
                          <span className="text-xs text-gray-500 ml-1">
                            (auto-filled from first payment)
                          </span>
                        </Label>
                        <Input
                          id="subscriptionPlanPaymentStartDate"
                          type="date"
                          value={formatDateForInput(
                            clientData.subscriptionPlan
                              ?.subscriptionPlanPaymentStartDate || null
                          )}
                          readOnly
                          className="mt-1 h-11 border-gray-200 focus:border-[#682A53] focus:ring-[#682A53]/20 bg-gray-50"
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
                                    value={payment.amount || ""}
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
                                        "amount",
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
