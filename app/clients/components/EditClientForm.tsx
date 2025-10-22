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
import { useLoading } from "../../../contexts/loadingContext";
import permissions from "../../utils/permissions";
import {
  getRecruiters,
  getSalesPersons,
} from "../../employees/actions/employeeActions";
import { Recruiter } from "../../types/employees/recruiter";
import { formatDateForInput, parseDateForState } from "../../utils/dateUtils";
import { PLAN_TEMPLATES, generatePlanName, getPlanDetails } from "../constants/subscriptionPlans";

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
  const { withLoading } = useLoading();
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

  // Plan template states (Subscription)
  const [planTemplate, setPlanTemplate] = useState<string>("");
  const [customMonthlyAmount, setCustomMonthlyAmount] = useState<number>(0);
  const [customDurationMonths, setCustomDurationMonths] = useState<number>(0);
  const [customPercentageAfterJob, setCustomPercentageAfterJob] = useState<number>(0);

  // Post-placement plan states
  const [postPlacementTotalAmount, setPostPlacementTotalAmount] = useState<number>(0);
  const [postPlacementDurationMonths, setPostPlacementDurationMonths] = useState<number>(0);
  const [postPlacementStartDate, setPostPlacementStartDate] = useState<Date | null>(null);

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
        (p) => p.paymentType === "Placement"
      ) || [];

    setSubscriptionPaymentSchedule(subscriptionPayments);
    setPostPlacementPaymentSchedule(postPlacementPayments);
  }, [client.paymentSchedules]);

  // Auto-populate payment start dates from first payment in schedule
  useEffect(() => {
    if (subscriptionPaymentSchedule.length > 0) {
      const firstPaymentDate = subscriptionPaymentSchedule
        .filter(
          (p): p is PaymentSchedule & { paymentDate: Date | string } =>
            p.paymentDate !== null && p.paymentDate !== undefined
        )
        .sort(
          (a, b) =>
            new Date(a.paymentDate).getTime() -
            new Date(b.paymentDate).getTime()
        )[0]?.paymentDate;

      if (
        firstPaymentDate &&
        !clientData.subscriptionPlan?.subscriptionPlanPaymentStartDate
      ) {
        // Format the date properly - handle both Date objects and strings
        let formattedDate: string;
        if (firstPaymentDate instanceof Date) {
          formattedDate = formatDateForInput(firstPaymentDate);
        } else {
          // Handle string case with explicit type assertion
          const dateString = firstPaymentDate as string;
          if (dateString.includes("T")) {
            formattedDate = formatDateForInput(new Date(dateString));
          } else {
            formattedDate = dateString;
          }
        }
        handleInputChange(
          "subscriptionPlan.subscriptionPlanPaymentStartDate",
          formattedDate
        );
      }
    }
  }, [
    subscriptionPaymentSchedule,
    clientData.subscriptionPlan?.subscriptionPlanPaymentStartDate,
  ]);

  useEffect(() => {
    if (postPlacementPaymentSchedule.length > 0) {
      const firstPaymentDate = postPlacementPaymentSchedule
        .filter(
          (p): p is PaymentSchedule & { paymentDate: Date | string } =>
            p.paymentDate !== null && p.paymentDate !== undefined
        )
        .sort(
          (a, b) =>
            new Date(a.paymentDate).getTime() -
            new Date(b.paymentDate).getTime()
        )[0]?.paymentDate;

      if (
        firstPaymentDate &&
        !clientData.postPlacementPlan?.postPlacementPlanPaymentStartDate
      ) {
        // Format the date properly - handle both Date objects and strings
        let formattedDate: string;
        if (firstPaymentDate instanceof Date) {
          formattedDate = formatDateForInput(firstPaymentDate);
        } else {
          // Handle string case with explicit type assertion
          const dateString = firstPaymentDate as string;
          if (dateString.includes("T")) {
            formattedDate = formatDateForInput(new Date(dateString));
          } else {
            formattedDate = dateString;
          }
        }
        handleInputChange(
          "postPlacementPlan.postPlacementPlanPaymentStartDate",
          formattedDate
        );
      }
    }
  }, [
    postPlacementPaymentSchedule,
    clientData.postPlacementPlan?.postPlacementPlanPaymentStartDate,
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
  };

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
    const startDateObj = new Date(startDate);

    for (let i = 0; i < planDetails.durationMonths; i++) {
      const paymentDate = new Date(startDateObj);
      paymentDate.setMonth(paymentDate.getMonth() + i);

      payments.push({
        paymentDate: parseDateForState(paymentDate.toISOString().split("T")[0]),
        originalAmount: planDetails.monthlyAmount,
        paidAmount: 0,
        remainingAmount: planDetails.monthlyAmount,
        dueDate: parseDateForState(paymentDate.toISOString().split("T")[0]),
        paymentType: "Subscription",
        paymentStatus: "Pending",
        assignedTo: null,
        paymentScheduleID: 0,
        clientID: clientData.clientID,
        subscriptionPlanID: clientData.subscriptionPlanID,
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

  // Generate post-placement payment schedule
  const generatePostPlacementSchedule = () => {
    if (!postPlacementStartDate) {
      alert("Please select a payment start date first");
      return;
    }

    if (!postPlacementDurationMonths || postPlacementDurationMonths < 1) {
      alert("Please enter the number of months");
      return;
    }

    // Validate required fields
    if (!postPlacementTotalAmount || postPlacementTotalAmount <= 0) {
      alert("Please enter a valid total amount");
      return;
    }

    const totalAmount = postPlacementTotalAmount;
    const monthlyAmount = Math.round((totalAmount / postPlacementDurationMonths) * 100) / 100;
    const planName = `Post-Placement - $${totalAmount.toFixed(2)} over ${postPlacementDurationMonths} months`;

    // Update plan name
    handleInputChange("postPlacementPlan.planName", planName);

    // Update payment start date
    handleInputChange("postPlacementPlan.postPlacementPlanPaymentStartDate", postPlacementStartDate);

    // Generate payment schedule
    const payments: PaymentSchedule[] = [];
    const startDateObj = new Date(postPlacementStartDate);

    for (let i = 0; i < postPlacementDurationMonths; i++) {
      const paymentDate = new Date(startDateObj);
      paymentDate.setMonth(paymentDate.getMonth() + i);

      payments.push({
        paymentDate: parseDateForState(paymentDate.toISOString().split("T")[0]),
        originalAmount: monthlyAmount,
        paidAmount: 0,
        remainingAmount: monthlyAmount,
        dueDate: parseDateForState(paymentDate.toISOString().split("T")[0]),
        paymentType: "Placement",
        paymentStatus: "Pending",
        assignedTo: null,
        paymentScheduleID: 0,
        clientID: clientData.clientID,
        subscriptionPlanID: null,
        postPlacementPlanID: clientData.postPlacementPlanID,
        createdTS: null,
        createdBy: null,
        updatedTS: null,
        updatedBy: null,
      });
    }

    setPostPlacementPaymentSchedule(payments);
  };

  // Clear post-placement payment schedule
  const clearPostPlacementSchedule = () => {
    setPostPlacementPaymentSchedule([]);
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
      originalAmount: 0,
      paidAmount: 0,
      remainingAmount: 0,
      dueDate: null,
      paymentType: type === "subscription" ? "Subscription" : "Placement",
      paymentStatus: "Pending",
      assignedTo: null,
      paymentScheduleID: 0,
      clientID: client.clientID,
      subscriptionPlanID: null,
      postPlacementPlanID: null,
      createdTS: null,
      createdBy: null,
      updatedTS: null,
      updatedBy: null,
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
    const errorKey = `${type}Payment_${index}_${
      field === "paymentDate" ? "date" : "amount"
    }`;
    if (errors[errorKey]) {
      setErrors((prev) => {
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
                field === "paymentDate" || field === "dueDate"
                  ? parseDateForState(value as string)
                  : field === "originalAmount" || field === "paidAmount" || field === "remainingAmount"
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

    // Check if subscription plan has an amount configured
    const hasSubscriptionAmount = clientData.subscriptionPlan?.planName?.trim();

    // SMART VALIDATION: Only require payment schedules if a plan with amount is configured
    if (hasSubscriptionAmount && subscriptionPaymentSchedule.length === 0) {
      newErrors.subscriptionPaymentSchedule =
        "Please click 'Generate Schedule' to create payment schedule for the subscription plan";
    }

    // Subscription validation - only if schedules exist
    if (subscriptionPaymentSchedule.length > 0) {
      subscriptionPaymentSchedule.forEach((payment, index) => {
        if (!payment.paymentDate) {
          newErrors[`subscriptionPayment_${index}_date`] =
            "Payment date is required";
        }
        if (!payment.originalAmount || payment.originalAmount <= 0) {
          newErrors[`subscriptionPayment_${index}_amount`] =
            "Payment amount must be greater than 0";
        }
        if (payment.originalAmount && payment.originalAmount > 1000000) {
          newErrors[`subscriptionPayment_${index}_amount`] =
            "Payment amount cannot exceed $1,000,000";
        }
      });

      // Check for duplicate payment dates in subscription
      const subscriptionDates = subscriptionPaymentSchedule
        .map((p) => p.paymentDate)
        .filter(Boolean);
      const duplicateSubscriptionDates = subscriptionDates.filter(
        (date, index) => subscriptionDates.indexOf(date) !== index
      );
      if (duplicateSubscriptionDates.length > 0) {
        newErrors.subscriptionDuplicateDates =
          "Subscription payment schedule cannot have duplicate dates";
      }
    }

    // Check if post placement plan has an amount configured
    const hasPostPlacementAmount =
      clientData.clientStatus === "Placed" &&
      (postPlacementTotalAmount > 0 || clientData.postPlacementPlan?.totalPostPlacementAmount);

    // SMART VALIDATION: Only require payment schedules if post placement plan has amount
    if (hasPostPlacementAmount && postPlacementPaymentSchedule.length === 0) {
      newErrors.postPlacementPaymentSchedule =
        "Please click 'Generate Schedule' to create payment schedule for the post-placement plan";
    }

    // Post-placement validation - only if schedules exist
    if (postPlacementPaymentSchedule.length > 0) {
      postPlacementPaymentSchedule.forEach((payment, index) => {
        if (!payment.paymentDate) {
          newErrors[`postPlacementPayment_${index}_date`] =
            "Payment date is required";
        }
        if (!payment.originalAmount || payment.originalAmount <= 0) {
          newErrors[`postPlacementPayment_${index}_amount`] =
            "Payment amount must be greater than 0";
        }
        if (payment.originalAmount && payment.originalAmount > 1000000) {
          newErrors[`postPlacementPayment_${index}_amount`] =
            "Payment amount cannot exceed $1,000,000";
        }
      });

      // Check for duplicate payment dates in post-placement
      const postPlacementDates = postPlacementPaymentSchedule
        .map((p) => p.paymentDate)
        .filter(Boolean);
      const duplicatePostPlacementDates = postPlacementDates.filter(
        (date, index) => postPlacementDates.indexOf(date) !== index
      );
      if (duplicatePostPlacementDates.length > 0) {
        newErrors.postPlacementDuplicateDates =
          "Post-placement payment schedule cannot have duplicate dates";
      }
    }

    // Plan name validation
    if (
      subscriptionPaymentSchedule.length > 0 &&
      !clientData.subscriptionPlan?.planName?.trim()
    ) {
      newErrors.subscriptionPlanName =
        "Subscription plan name is required when payments are scheduled";
    }

    if (
      postPlacementPaymentSchedule.length > 0 &&
      !clientData.postPlacementPlan?.planName?.trim()
    ) {
      newErrors.postPlacementPlanName =
        "Post-placement plan name is required when payments are scheduled";
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
      // Build post placement plan object from local state if client status is "Placed"
      // This ensures data is saved even if admin didn't click "Generate Schedule" button
      let updatedPostPlacementPlan = clientData.postPlacementPlan;

      if (clientData.clientStatus === "Placed" && (postPlacementTotalAmount > 0 || postPlacementDurationMonths > 0 || postPlacementStartDate)) {
        const postPlacementPlanName = postPlacementTotalAmount && postPlacementDurationMonths
          ? `Post-Placement - $${postPlacementTotalAmount.toFixed(2)} over ${postPlacementDurationMonths} months`
          : clientData.postPlacementPlan?.planName || "";

        updatedPostPlacementPlan = {
          ...clientData.postPlacementPlan,
          planName: postPlacementPlanName,
          totalPostPlacementAmount: postPlacementTotalAmount || clientData.postPlacementPlan?.totalPostPlacementAmount || 0,
          postPlacementPlanPaymentStartDate: postPlacementStartDate || clientData.postPlacementPlan?.postPlacementPlanPaymentStartDate,
        } as any;
      }

      const hasPostPlacementData =
        clientData.clientStatus === "Placed" && (
          postPlacementTotalAmount > 0 ||
          postPlacementDurationMonths > 0 ||
          postPlacementStartDate != null ||
          updatedPostPlacementPlan?.planName?.trim() ||
          updatedPostPlacementPlan?.postPlacementPlanPaymentStartDate ||
          updatedPostPlacementPlan?.totalPostPlacementAmount ||
          postPlacementPaymentSchedule.length > 0
        );

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
          ? updatedPostPlacementPlan
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
          subscriptionPlanID: ps.paymentType === "Subscription" ? (clientData.subscriptionPlanID || client.subscriptionPlanID) : null,
          postPlacementPlanID: ps.paymentType === "Placement" ? (clientData.postPlacementPlanID || client.postPlacementPlanID) : null,
          createdTS: ps.createdTS || null,
          createdBy: ps.createdBy || null,
          updatedTS: ps.updatedTS || null,
          updatedBy: ps.updatedBy || null,
        })),
      };

      const success = await withLoading(
        updateClient(
          client.clientID,
          submitData,
          serviceAgreementFile,
          promissoryNoteFile
        )
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
      (sum, payment) => sum + (payment.originalAmount || 0),
      0
    ) || 0;

  const totalPaid =
    client?.paymentSchedules?.reduce(
      (sum, payment) => sum + (payment.paidAmount || 0),
      0
    ) || 0;

  // Calculate subscription-specific totals
  const subscriptionTotalDue = subscriptionPaymentSchedule.reduce(
    (sum, payment) => sum + (payment.originalAmount || 0),
    0
  );

  const subscriptionTotalPaid = subscriptionPaymentSchedule.reduce(
    (sum, payment) => sum + (payment.paidAmount || 0),
    0
  );

  // Calculate post-placement-specific totals
  const postPlacementTotalDue = postPlacementPaymentSchedule.reduce(
    (sum, payment) => sum + (payment.originalAmount || 0),
    0
  );

  const postPlacementTotalPaid = postPlacementPaymentSchedule.reduce(
    (sum, payment) => sum + (payment.paidAmount || 0),
    0
  );

  return (
    <div className="flex flex-col h-screen">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-gray-50 border-b shadow-sm">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-white border-b">
          <Button
            onClick={handleBack}
            className="bg-[#682A53] hover:bg-[#682A53]/90 text-white h-8 text-sm"
          >
            <ArrowLeft className="h-3 w-3 mr-1" />
            Back to Client Details
          </Button>
        </div>

        {/* Client Info Header - Compact */}
        <div className="bg-white px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#682A53] rounded-full flex items-center justify-center">
                <Edit className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Edit Client
                </h1>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-600">
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
            {permissions.clients[userRole]?.subscriptionInfo?.view && (
            <div className="text-right">
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-xs text-gray-500">Total Due</div>
                  <div className="text-sm font-semibold text-[#682A53]">
                    {formatCurrency(totalDue)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Total Paid</div>
                  <div className="text-sm font-semibold text-green-600">
                    {formatCurrency(totalPaid)}
                  </div>
                </div>
              </div>
            </div>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto">
      <form onSubmit={handleSubmit} className="client-form p-4">
        {/* Horizontal Dashboard Layout */}
        <div className="space-y-4">
          {/* Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
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
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Marketing & Assignment - Admin and Marketing Manager Only */}
            {(userRole === "Admin" || userRole === "Marketing_Manager") && (
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
                    <Label htmlFor="clientStatus">Client Status</Label>
                    <Select
                      value={clientData.clientStatus || ""}
                      onValueChange={(value) =>
                        handleInputChange("clientStatus", value)
                      }
                      disabled={!canEdit}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select client status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Sales">Sales</SelectItem>
                        <SelectItem value="Resume">Resume</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Remarketing">Remarketing</SelectItem>
                        <SelectItem value="Placed">Placed</SelectItem>
                        <SelectItem value="BackedOut">Backed Out</SelectItem>
                        <SelectItem value="OnHold">On Hold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

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

                  {/* Marketing Credentials - Admin Only */}
                  {userRole === "Admin" && (
                    <>
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
                    </>
                  )}

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

                </div>
              </CardContent>
            </Card>
            )}

            {/* Card 3: Subscription */}
            {permissions.clients[userRole]?.subscriptionInfo?.view && (
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
                        disabled={!canEdit}
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
                                disabled={!canEdit}
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
                              disabled={!canEdit}
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
                                disabled={!canEdit}
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
                          disabled={!canEdit}
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
                    {canEdit && (
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
                    )}
                  </div>

                  {/* Service Agreement */}
                  <div>
                    <Label
                      htmlFor="serviceAgreement"
                      className="text-sm font-medium text-gray-700"
                    >
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
                              document
                                .getElementById("serviceAgreement")
                                ?.click()
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
                      {!client.serviceAgreementUrl &&
                        !serviceAgreementFileName && (
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
                        <h3 className="text-sm font-medium text-gray-900 mb-2">
                          No payment schedule yet
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                          Add payments to create a schedule for this
                          subscription plan.
                        </p>
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
                            {canEdit && payment.paidAmount === 0 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  removePaymentRow(index, "subscription")
                                }
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
                                  value={formatDateForInput(
                                    payment.paymentDate
                                  )}
                                  onChange={(e) =>
                                    updatePaymentSchedule(
                                      index,
                                      "paymentDate",
                                      e.target.value,
                                      "subscription"
                                    )
                                  }
                                  disabled={!canEdit || payment.paidAmount > 0}
                                  className="h-11 border-gray-200 focus:border-[#682A53] focus:ring-[#682A53]/20"
                                />
                                {errors[
                                  `subscriptionPayment_${index}_date`
                                ] && (
                                  <p className="text-xs text-red-500 mt-1">
                                    {
                                      errors[
                                        `subscriptionPayment_${index}_date`
                                      ]
                                    }
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
                                        e.target.value,
                                        "subscription"
                                      );
                                    }}
                                    disabled={!canEdit || payment.paidAmount > 0}
                                    className="h-11 pl-8 border-gray-200 focus:border-[#682A53] focus:ring-[#682A53]/20"
                                  />
                                  {errors[
                                    `subscriptionPayment_${index}_amount`
                                  ] && (
                                    <p className="text-xs text-red-500 mt-1">
                                      {
                                        errors[
                                          `subscriptionPayment_${index}_amount`
                                        ]
                                      }
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

            {/* Card 4: Post-Placement - Only show for Admins with Placed status */}
            {clientData.clientStatus === "Placed" &&
             permissions.clients[userRole]?.postPlacementInfo?.view && (
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-[#682A53] rounded-full flex items-center justify-center">
                      <FileText className="h-4 w-4 text-white" />
                    </div>
                    <CardTitle className="text-base">Post-Placement</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-6">
                    {/* Plan Details */}
                    <div className="space-y-4">
                      {/* Plan Configuration */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm font-semibold text-blue-900">
                            Post-Placement Plan Configuration
                          </span>
                        </div>

                        {/* Row 1: Total Amount and Duration */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label
                              htmlFor="postPlacementTotalAmount"
                              className="text-sm font-medium text-gray-700"
                            >
                              Total Amount ($)
                            </Label>
                            <div className="relative mt-1">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-sm">
                                $
                              </span>
                              <Input
                                id="postPlacementTotalAmount"
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={postPlacementTotalAmount || ""}
                                onChange={(e) =>
                                  setPostPlacementTotalAmount(parseFloat(e.target.value) || 0)
                                }
                                disabled={!canEdit}
                                className="h-11 pl-8 border-gray-200 focus:border-[#682A53] focus:ring-[#682A53]/20"
                                placeholder="0.00"
                              />
                            </div>
                          </div>

                          {/* Duration */}
                          <div>
                            <Label
                              htmlFor="postPlacementDurationMonths"
                              className="text-sm font-medium text-gray-700"
                            >
                              Duration (Months)
                            </Label>
                            <Input
                              id="postPlacementDurationMonths"
                              type="number"
                              min="1"
                              value={postPlacementDurationMonths || ""}
                              onChange={(e) =>
                                setPostPlacementDurationMonths(parseInt(e.target.value) || 0)
                              }
                              disabled={!canEdit}
                              className="mt-1 h-11 border-gray-200 focus:border-[#682A53] focus:ring-[#682A53]/20"
                              placeholder="0"
                            />
                          </div>
                        </div>

                        {/* Row 2: Payment Start Date (Full Width) */}
                        <div>
                            <Label
                              htmlFor="postPlacementStartDate"
                              className="text-sm font-medium text-gray-700"
                            >
                              Payment Start Date
                            </Label>
                            <div className="relative mt-1">
                              <Input
                                id="postPlacementStartDate"
                                type="date"
                                value={postPlacementStartDate ? formatDateForInput(postPlacementStartDate) : ""}
                                onChange={(e) =>
                                  setPostPlacementStartDate(parseDateForState(e.target.value))
                                }
                                disabled={!canEdit}
                                className="h-11 border-gray-200 focus:border-[#682A53] focus:ring-[#682A53]/20"
                                style={{
                                  paddingRight: '2.5rem',
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const input = document.getElementById('postPlacementStartDate') as HTMLInputElement;
                                  if (input && input.showPicker) {
                                    input.showPicker();
                                  }
                                }}
                                disabled={!canEdit}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 hover:bg-gray-50 rounded-r-md transition-colors"
                                tabIndex={-1}
                              >
                                <svg
                                  className="w-5 h-5 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                              </button>
                            </div>
                        </div>
                      </div>

                      {/* Plan Name - Auto-filled, read-only */}
                      <div>
                        <Label
                          htmlFor="postPlacementPlanName"
                          className="text-sm font-medium text-gray-700"
                        >
                          Plan Name
                          <span className="text-xs text-gray-500 ml-1">
                            (auto-generated)
                          </span>
                        </Label>
                        <Input
                          id="postPlacementPlanName"
                          value={clientData.postPlacementPlan?.planName || ""}
                          readOnly
                          className="mt-1 h-11 border-gray-200 bg-gray-50 cursor-not-allowed"
                          placeholder="Configure plan above to auto-fill"
                        />
                      </div>

                      {/* Total Amount Display */}
                      <div>
                        <Label
                          htmlFor="totalPostPlacementAmount"
                          className="text-sm font-medium text-gray-700"
                        >
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
                              (sum, payment) => sum + (payment.originalAmount || 0),
                              0
                            )}
                            disabled={true}
                            className="h-11 pl-8 bg-gray-50 border-gray-200"
                          />
                        </div>
                      </div>

                      {/* Generate and Clear Buttons */}
                      {canEdit && (
                        <div className="flex flex-col sm:flex-row gap-2 w-full">
                          <Button
                            type="button"
                            onClick={generatePostPlacementSchedule}
                            className="w-full sm:flex-1 bg-[#682A53] hover:bg-[#682A53]/90 text-white h-11 text-xs sm:text-sm whitespace-nowrap"
                          >
                            <Plus className="h-4 w-4 mr-1 flex-shrink-0" />
                            <span className="hidden sm:inline">Generate Schedule</span>
                            <span className="sm:hidden">Generate</span>
                          </Button>
                          <Button
                            type="button"
                            onClick={clearPostPlacementSchedule}
                            variant="outline"
                            className="w-full sm:w-auto border-red-500 text-red-600 hover:bg-red-50 h-11 text-xs sm:text-sm px-4 whitespace-nowrap"
                            disabled={postPlacementPaymentSchedule.length === 0}
                          >
                            <Trash2 className="h-4 w-4 mr-1 flex-shrink-0" />
                            Clear
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Promissory Note */}
                    <div>
                      <Label
                        htmlFor="promissoryNote"
                        className="text-sm font-medium text-gray-700"
                      >
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
                                document
                                  .getElementById("promissoryNote")
                                  ?.click()
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
                        {!client.promissoryNoteUrl &&
                          !promissoryNoteFileName && (
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
                          <Label className="text-lg font-semibold text-gray-900">
                            Payment Schedule
                          </Label>
                          <p className="text-sm text-gray-500 mt-1">
                            {postPlacementPaymentSchedule.length === 0
                              ? "No payments added yet"
                              : `${
                                  postPlacementPaymentSchedule.length
                                } payment${
                                  postPlacementPaymentSchedule.length > 1
                                    ? "s"
                                    : ""
                                } scheduled`}
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
                          <h3 className="text-sm font-medium text-gray-900 mb-2">
                            No payment schedule yet
                          </h3>
                          <p className="text-sm text-gray-500 mb-4">
                            Add payments to create a schedule for this
                            post-placement plan.
                          </p>
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
                          {postPlacementPaymentSchedule.map(
                            (payment, index) => (
                              <div
                                key={index}
                                className="group relative bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:border-[#682A53]/20 mt-3 mb-3"
                              >
                                {/* Payment Number Badge */}
                                <div className="absolute -top-3 -left-3 w-7 h-7 bg-[#682A53] text-white rounded-full flex items-center justify-center text-xs font-semibold shadow-md z-10">
                                  {index + 1}
                                </div>

                                {/* Delete Button */}
                                {canEdit && payment.paidAmount === 0 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      removePaymentRow(index, "postPlacement")
                                    }
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
                                      value={formatDateForInput(
                                        payment.paymentDate
                                      )}
                                      onChange={(e) =>
                                        updatePaymentSchedule(
                                          index,
                                          "paymentDate",
                                          e.target.value,
                                          "postPlacement"
                                        )
                                      }
                                      disabled={!canEdit || payment.paidAmount > 0}
                                      className="h-11 border-gray-200 focus:border-[#682A53] focus:ring-[#682A53]/20"
                                    />
                                    {errors[
                                      `postPlacementPayment_${index}_date`
                                    ] && (
                                      <p className="text-xs text-red-500 mt-1">
                                        {
                                          errors[
                                            `postPlacementPayment_${index}_date`
                                          ]
                                        }
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
                                        value={payment.originalAmount || ""}
                                        onChange={(e) => {
                                          const value = parseFloat(
                                            e.target.value
                                          );
                                          if (
                                            value < 0.01 &&
                                            e.target.value !== ""
                                          ) {
                                            return; // Prevent negative values and values less than 0.01
                                          }
                                          updatePaymentSchedule(
                                            index,
                                            "originalAmount",
                                            e.target.value,
                                            "postPlacement"
                                          );
                                        }}
                                        disabled={!canEdit || payment.paidAmount > 0}
                                        className="h-11 pl-8 border-gray-200 focus:border-[#682A53] focus:ring-[#682A53]/20"
                                      />
                                      {errors[
                                        `postPlacementPayment_${index}_amount`
                                      ] && (
                                        <p className="text-xs text-red-500 mt-1">
                                          {
                                            errors[
                                              `postPlacementPayment_${index}_amount`
                                            ]
                                          }
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
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
              disabled={isLoading || !canEdit}
              className="bg-[#682A53] hover:bg-[#682A53]/90 text-white w-full sm:w-auto"
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update Client
            </Button>
          </div>
        </div>
      </form>
      </div>
    </div>
  );
}
