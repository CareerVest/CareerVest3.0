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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";
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
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showPostPlacementModal, setShowPostPlacementModal] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

      <form onSubmit={handleSubmit}>
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-[#682A53] rounded-full flex items-center justify-center">
                      <CreditCard className="h-4 w-4 text-white" />
                    </div>
                    <CardTitle className="text-base">Subscription</CardTitle>
                  </div>
                  <Dialog
                    open={showSubscriptionModal}
                    onOpenChange={setShowSubscriptionModal}
                  >
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-6xl max-h-[90vh]">
                      <DialogHeader>
                        <DialogTitle>Edit Subscription Information</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6">
                        {/* Plan Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="modal-subscriptionPlanName">
                              Plan Name
                            </Label>
                            <Input
                              id="modal-subscriptionPlanName"
                              value={
                                clientData.subscriptionPlan?.planName || ""
                              }
                              onChange={(e) =>
                                handleInputChange(
                                  "subscriptionPlan.planName",
                                  e.target.value
                                )
                              }
                              disabled={!canEdit}
                            />
                          </div>
                          <div>
                            <Label htmlFor="modal-subscriptionPlanPaymentStartDate">
                              Payment Start Date
                            </Label>
                            <Input
                              id="modal-subscriptionPlanPaymentStartDate"
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
                            />
                          </div>
                          <div>
                            <Label htmlFor="modal-totalSubscriptionAmount">
                              Total Amount
                            </Label>
                            <Input
                              id="modal-totalSubscriptionAmount"
                              type="number"
                              value={subscriptionPaymentSchedule.reduce(
                                (sum, payment) => sum + (payment.amount || 0),
                                0
                              )}
                              disabled={true}
                              className="bg-gray-50"
                            />
                          </div>
                        </div>

                        {/* Service Agreement */}
                        <div>
                          <Label htmlFor="modal-serviceAgreement">
                            Service Agreement
                          </Label>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Input
                                id="modal-serviceAgreement"
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setServiceAgreementFile(file);
                                    setServiceAgreementFileName(file.name);
                                  }
                                }}
                                disabled={!canEdit}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  document
                                    .getElementById("modal-serviceAgreement")
                                    ?.click()
                                }
                                disabled={!canEdit}
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
                            {client.serviceAgreementUrl && (
                              <div className="flex items-center space-x-2">
                                <ExternalLink className="h-4 w-4 text-blue-500" />
                                <a
                                  href={client.serviceAgreementUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-500 hover:underline"
                                >
                                  View Current Service Agreement
                                </a>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Payment Schedule */}
                        <div className="border-t pt-4">
                          <div className="flex items-center justify-between mb-4">
                            <Label className="text-lg font-semibold">
                              Payment Schedule
                            </Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addPaymentRow("subscription")}
                              disabled={!canEdit}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add Payment
                            </Button>
                          </div>
                          <div className="border rounded-lg overflow-hidden">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-1/3">Date</TableHead>
                                  <TableHead className="w-1/3">
                                    Amount
                                  </TableHead>
                                  <TableHead className="w-1/3">
                                    Actions
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {subscriptionPaymentSchedule.map(
                                  (payment, index) => (
                                    <TableRow key={index}>
                                      <TableCell>
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
                                          disabled={!canEdit}
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <Input
                                          type="number"
                                          placeholder="Enter amount"
                                          value={payment.amount || ""}
                                          onChange={(e) =>
                                            updatePaymentSchedule(
                                              index,
                                              "amount",
                                              e.target.value,
                                              "subscription"
                                            )
                                          }
                                          disabled={!canEdit}
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={() =>
                                            removePaymentRow(
                                              index,
                                              "subscription"
                                            )
                                          }
                                          disabled={!canEdit}
                                        >
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          Remove
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  )
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div>
                    <Label>Plan Name</Label>
                    <p className="text-sm font-medium text-gray-900">
                      {clientData.subscriptionPlan?.planName || "N/A"}
                    </p>
                  </div>

                  <div>
                    <Label>Payment Start Date</Label>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(
                        clientData.subscriptionPlan
                          ?.subscriptionPlanPaymentStartDate || null
                      )}
                    </p>
                  </div>

                  <div>
                    <Label>Total Amount</Label>
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(
                        subscriptionPaymentSchedule.reduce(
                          (sum, payment) => sum + (payment.amount || 0),
                          0
                        )
                      )}
                    </p>
                  </div>

                  <div>
                    <Label>Service Agreement</Label>
                    {client.serviceAgreementUrl ? (
                      <div className="flex items-center space-x-2">
                        <ExternalLink className="h-4 w-4 text-blue-500" />
                        <a
                          href={client.serviceAgreementUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-500 hover:underline"
                        >
                          View Service Agreement
                        </a>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        No agreement uploaded
                      </p>
                    )}
                  </div>

                  {/* Payment Schedule Display */}
                  <div className="border-t pt-4">
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {subscriptionPaymentSchedule
                        .slice(0, 3)
                        .map((payment, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm"
                          >
                            <span className="text-gray-600">
                              {formatDate(payment.paymentDate)}
                            </span>
                            <span className="font-medium">
                              {formatCurrency(payment.amount || 0)}
                            </span>
                          </div>
                        ))}
                      {subscriptionPaymentSchedule.length > 3 && (
                        <div className="text-center text-sm text-gray-500">
                          +{subscriptionPaymentSchedule.length - 3} more
                          payments
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card 4: Post-Placement (only shown for placed clients) */}
            {clientData.clientStatus === "Placed" && (
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-[#682A53] rounded-full flex items-center justify-center">
                        <FileText className="h-4 w-4 text-white" />
                      </div>
                      <CardTitle className="text-base">
                        Post-Placement
                      </CardTitle>
                    </div>
                    <Dialog
                      open={showPostPlacementModal}
                      onOpenChange={setShowPostPlacementModal}
                    >
                      <DialogTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-6xl max-h-[90vh]">
                        <DialogHeader>
                          <DialogTitle>
                            Edit Post-Placement Information
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6">
                          {/* Plan Details */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="modal-postPlacementPlanName">
                                Plan Name
                              </Label>
                              <Input
                                id="modal-postPlacementPlanName"
                                value={
                                  clientData.postPlacementPlan?.planName || ""
                                }
                                onChange={(e) =>
                                  handleInputChange(
                                    "postPlacementPlan.planName",
                                    e.target.value
                                  )
                                }
                                disabled={!canEdit}
                              />
                            </div>
                            <div>
                              <Label htmlFor="modal-postPlacementPlanPaymentStartDate">
                                Payment Start Date
                              </Label>
                              <Input
                                id="modal-postPlacementPlanPaymentStartDate"
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
                              />
                            </div>
                            <div>
                              <Label htmlFor="modal-totalPostPlacementAmount">
                                Total Amount
                              </Label>
                              <Input
                                id="modal-totalPostPlacementAmount"
                                type="number"
                                value={postPlacementPaymentSchedule.reduce(
                                  (sum, payment) => sum + (payment.amount || 0),
                                  0
                                )}
                                disabled={true}
                                className="bg-gray-50"
                              />
                            </div>
                          </div>

                          {/* Promissory Note */}
                          <div>
                            <Label htmlFor="modal-promissoryNote">
                              Promissory Note
                            </Label>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Input
                                  id="modal-promissoryNote"
                                  type="file"
                                  accept=".pdf,.doc,.docx"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      setPromissoryNoteFile(file);
                                      setPromissoryNoteFileName(file.name);
                                    }
                                  }}
                                  disabled={!canEdit}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    document
                                      .getElementById("modal-promissoryNote")
                                      ?.click()
                                  }
                                  disabled={!canEdit}
                                >
                                  <Upload className="h-4 w-4 mr-2" />
                                  Browse
                                </Button>
                              </div>
                              {promissoryNoteFileName && (
                                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded border">
                                  <FileText className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm text-gray-700">
                                    {promissoryNoteFileName}
                                  </span>
                                </div>
                              )}
                              {client.promissoryNoteUrl && (
                                <div className="flex items-center space-x-2">
                                  <ExternalLink className="h-4 w-4 text-blue-500" />
                                  <a
                                    href={client.promissoryNoteUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-500 hover:underline"
                                  >
                                    View Current Promissory Note
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Payment Schedule */}
                          <div className="border-t pt-4">
                            <div className="flex items-center justify-between mb-4">
                              <Label className="text-lg font-semibold">
                                Payment Schedule
                              </Label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addPaymentRow("postPlacement")}
                                disabled={!canEdit}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Payment
                              </Button>
                            </div>
                            <div className="border rounded-lg overflow-hidden">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="w-1/3">
                                      Date
                                    </TableHead>
                                    <TableHead className="w-1/3">
                                      Amount
                                    </TableHead>
                                    <TableHead className="w-1/3">
                                      Actions
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {postPlacementPaymentSchedule.map(
                                    (payment, index) => (
                                      <TableRow key={index}>
                                        <TableCell>
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
                                            disabled={!canEdit}
                                          />
                                        </TableCell>
                                        <TableCell>
                                          <Input
                                            type="number"
                                            placeholder="Enter amount"
                                            value={payment.amount || ""}
                                            onChange={(e) =>
                                              updatePaymentSchedule(
                                                index,
                                                "amount",
                                                e.target.value,
                                                "postPlacement"
                                              )
                                            }
                                            disabled={!canEdit}
                                          />
                                        </TableCell>
                                        <TableCell>
                                          <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                              removePaymentRow(
                                                index,
                                                "postPlacement"
                                              )
                                            }
                                            disabled={!canEdit}
                                          >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Remove
                                          </Button>
                                        </TableCell>
                                      </TableRow>
                                    )
                                  )}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div>
                      <Label>Plan Name</Label>
                      <p className="text-sm font-medium text-gray-900">
                        {clientData.postPlacementPlan?.planName || "N/A"}
                      </p>
                    </div>

                    <div>
                      <Label>Payment Start Date</Label>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(
                          clientData.postPlacementPlan
                            ?.postPlacementPlanPaymentStartDate || null
                        )}
                      </p>
                    </div>

                    <div>
                      <Label>Total Amount</Label>
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(
                          postPlacementPaymentSchedule.reduce(
                            (sum, payment) => sum + (payment.amount || 0),
                            0
                          )
                        )}
                      </p>
                    </div>

                    <div>
                      <Label>Promissory Note</Label>
                      {client.promissoryNoteUrl ? (
                        <div className="flex items-center space-x-2">
                          <ExternalLink className="h-4 w-4 text-blue-500" />
                          <a
                            href={client.promissoryNoteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-500 hover:underline"
                          >
                            View Promissory Note
                          </a>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">
                          No promissory note uploaded
                        </p>
                      )}
                    </div>

                    {/* Payment Schedule Display */}
                    <div className="border-t pt-4">
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {postPlacementPaymentSchedule
                          .slice(0, 3)
                          .map((payment, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm"
                            >
                              <span className="text-gray-600">
                                {formatDate(payment.paymentDate)}
                              </span>
                              <span className="font-medium">
                                {formatCurrency(payment.amount || 0)}
                              </span>
                            </div>
                          ))}
                        {postPlacementPaymentSchedule.length > 3 && (
                          <div className="text-center text-sm text-gray-500">
                            +{postPlacementPaymentSchedule.length - 3} more
                            payments
                          </div>
                        )}
                      </div>
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
