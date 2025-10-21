"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../../components/ui/button";
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
  ArrowLeft,
  Eye,
  EyeOff,
  ExternalLink,
  User,
  Mail,
  CreditCard,
  FileText,
} from "lucide-react";
import { getClient } from "../actions/clientActions";
import { useApiWithLoading } from "../../../lib/apiWithLoading";
import type {
  ClientDetail,
  PaymentSchedule,
} from "../../types/Clients/ClientDetail";
import { useAuth } from "../../../contexts/authContext";
import permissions from "../../utils/permissions";

export default function ClientView({ params }: { params: { id: string } }) {
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { roles } = useAuth();
  const { apiCall } = useApiWithLoading();

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
    const fetchClient = async () => {
      try {
        const clientData = await apiCall(getClient(Number(params.id)), {
          showLoading: true,
        });
        if (clientData) {
          setClient(clientData);
        } else {
          console.error("Client not found");
        }
      } catch (error) {
        console.error("Failed to fetch client:", error);
        alert(
          "Failed to load client data. Please try again or contact support."
        );
      }
    };

    fetchClient();
  }, [params.id]);

  const handleBack = () => {
    // Preserve search state when going back to clients list
    const searchParams = new URLSearchParams(window.location.search);
    const search = searchParams.get("search");
    const backUrl = search ? `/clients?search=${search}` : "/clients";
    router.push(backUrl);
  };

  const handleClickShowPassword = () => setShowPassword((prev) => !prev);

  const canEdit =
    !!permissions.clients[userRole]?.basicInfo.edit ||
    (typeof permissions.clients[userRole]?.marketingInfo.edit === "object"
      ? Object.values(
          permissions.clients[userRole]?.marketingInfo.edit || {}
        ).some((v) => v)
      : !!permissions.clients[userRole]?.marketingInfo.edit) ||
    !!permissions.clients[userRole]?.subscriptionInfo.edit ||
    !!permissions.clients[userRole]?.postPlacementInfo.edit;

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Separate payment schedules by type
  const subscriptionPayments =
    client?.paymentSchedules?.filter(
      (payment) => payment.paymentType === "Subscription"
    ) || [];

  const postPlacementPayments =
    client?.paymentSchedules?.filter(
      (payment) => payment.paymentType === "Placement"
    ) || [];

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
  const subscriptionTotalDue = subscriptionPayments.reduce(
    (sum, payment) => sum + (payment.originalAmount || 0),
    0
  );

  const subscriptionTotalPaid = subscriptionPayments.reduce(
    (sum, payment) => sum + (payment.paidAmount || 0),
    0
  );

  // Calculate post-placement-specific totals
  const postPlacementTotalDue = postPlacementPayments.reduce(
    (sum, payment) => sum + (payment.originalAmount || 0),
    0
  );

  const postPlacementTotalPaid = postPlacementPayments.reduce(
    (sum, payment) => sum + (payment.paidAmount || 0),
    0
  );

  if (!client) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Clients
          </Button>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">
            Client Not Found
          </h2>
          <p className="text-gray-600 mt-2">
            The requested client could not be found.
          </p>
        </div>
      </div>
    );
  }

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
            Back to Clients
          </Button>
          <div className="flex items-center space-x-2">
            {canEdit && (
              <Button
                onClick={() => router.push(`/clients/${client.clientID}/edit`)}
                className="bg-[#682A53] hover:bg-[#682A53]/90 text-white h-8 text-sm"
              >
                Edit Client
              </Button>
            )}
          </div>
        </div>

        {/* Client Info Header - Compact */}
        <div className="bg-white px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#682A53] rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {client.clientName}
                </h1>
                <Badge
                  variant={
                    client.clientStatus === "Active" ? "success" : "default"
                  }
                  className="text-xs mt-0.5"
                >
                  {client.clientStatus}
                </Badge>
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
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
        {/* Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
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
                  <label className="text-sm font-medium text-gray-500">
                    Enrollment Date
                  </label>
                  <p className="text-sm font-medium">
                    {formatDate(client.enrollmentDate)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Tech Stack
                  </label>
                  <p className="text-sm font-medium">
                    {client.techStack || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Visa Status
                  </label>
                  <p className="text-sm font-medium">
                    {client.visaStatus || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Phone Number
                  </label>
                  <p className="text-sm font-medium">
                    {client.personalPhoneNumber || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Email Address
                  </label>
                  <p className="text-sm font-medium">
                    {client.personalEmailAddress || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    LinkedIn URL
                  </label>
                  {client.linkedInURL ? (
                    <a
                      href={client.linkedInURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      View Profile
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  ) : (
                    <p className="text-sm font-medium">N/A</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Assigned Sales Person
                  </label>
                  <p className="text-sm font-medium">
                    {client.assignedSalesPersonName || "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Marketing & Assignment */}
          {permissions.clients[userRole]?.marketingInfo?.view && (
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
                  <label className="text-sm font-medium text-gray-500">
                    Marketing Start Date
                  </label>
                  <p className="text-sm font-medium">
                    {formatDate(client.marketingStartDate)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Marketing End Date
                  </label>
                  <p className="text-sm font-medium">
                    {formatDate(client.marketingEndDate)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Marketing Email ID
                  </label>
                  <p className="text-sm font-medium">
                    {client.marketingEmailID || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Marketing Email Password
                  </label>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium">
                      {showPassword
                        ? client.marketingEmailPassword || "N/A"
                        : "••••••••"}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClickShowPassword}
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
                  <label className="text-sm font-medium text-gray-500">
                    Assigned Recruiter
                  </label>
                  <p className="text-sm font-medium">
                    {client.assignedRecruiterName || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Placed Date
                  </label>
                  <p className="text-sm font-medium">
                    {formatDate(client.placedDate)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Backed Out Date
                  </label>
                  <p className="text-sm font-medium">
                    {formatDate(client.backedOutDate)}
                  </p>
                </div>
                {client.backedOutReason && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Backed Out Reason
                    </label>
                    <p className="text-sm font-medium">
                      {client.backedOutReason}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          )}

          {/* Card 3: Subscription */}
          {permissions.clients[userRole]?.subscriptionInfo?.view && (
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
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Total Due
                    </label>
                    <p className="text-sm font-semibold text-[#682A53]">
                      {formatCurrency(subscriptionTotalDue)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Total Paid
                    </label>
                    <p className="text-sm font-semibold text-green-600">
                      {formatCurrency(subscriptionTotalPaid)}
                    </p>
                  </div>
                </div>
                {client.subscriptionPlan && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Plan Name
                      </label>
                      <p className="text-sm font-medium">
                        {client.subscriptionPlan.planName}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Payment Start Date
                        </label>
                        <p className="text-sm font-medium">
                          {formatDate(
                            client.subscriptionPlan
                              .subscriptionPlanPaymentStartDate
                          )}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Total Amount
                        </label>
                        <p className="text-sm font-medium">
                          {formatCurrency(
                            client.subscriptionPlan.totalSubscriptionAmount || 0
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Service Agreement */}
                {client.subscriptionPlan?.serviceAgreementUrl && (
                  <div className="border-t pt-3">
                    <label className="text-sm font-medium text-gray-500">
                      Service Agreement
                    </label>
                    <a
                      href={client.subscriptionPlan.serviceAgreementUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      View Document
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                )}

                {/* Subscription Payment Schedule */}
                {subscriptionPayments.length > 0 && (
                  <div className="border-t pt-3">
                    <div className="mb-2">
                      <label className="text-xs font-semibold text-gray-700 mb-1 block">
                        Payment Schedule
                      </label>
                      <p className="text-xs text-gray-500">
                        {subscriptionPayments.length} payment{subscriptionPayments.length > 1 ? 's' : ''} •
                        {subscriptionPayments.filter(p => p.paymentStatus === "Paid").length} paid, {subscriptionPayments.filter(p => p.paymentStatus === "Partially_Paid").length} partial, {subscriptionPayments.filter(p => p.paymentStatus === "Pending").length} pending
                      </p>
                    </div>
                    <div className="space-y-2 px-2 py-2">
                      {subscriptionPayments.map((payment, index) => (
                        <div
                          key={payment.paymentScheduleID}
                          className="relative bg-white border border-gray-200 rounded p-2 shadow-sm hover:shadow transition-all duration-200"
                        >
                          {/* Payment Number Badge */}
                          <div className="absolute -top-2 -left-2 w-6 h-6 bg-[#682A53] text-white rounded-full flex items-center justify-center text-xs font-semibold shadow z-10">
                            {index + 1}
                          </div>

                          {/* Payment Status Badge */}
                          <div className="absolute -top-2 -right-2 z-10">
                            <Badge
                              variant={payment.paymentStatus === "Paid" ? "default" : "secondary"}
                              className={`text-xs ${
                                payment.paymentStatus === "Paid"
                                  ? "bg-green-500 hover:bg-green-600 text-white"
                                  : payment.paymentStatus === "Partially_Paid"
                                  ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                  : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                              }`}
                            >
                              {payment.paymentStatus === "Paid" ? "Paid" : payment.paymentStatus === "Partially_Paid" ? "Partial" : "Pending"}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-2 mt-1">
                            <div>
                              <label className="text-xs font-medium text-gray-500 mb-0.5 block">
                                Due Date
                              </label>
                              <span className="text-xs font-medium text-gray-900">
                                {formatDate(payment.dueDate || payment.paymentDate)}
                              </span>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-500 mb-0.5 block">
                                Amount
                              </label>
                              <span className="text-xs font-semibold text-gray-900">
                                {formatCurrency(payment.originalAmount)}
                              </span>
                            </div>
                            {/* Only show Paid and Remaining for partial/paid payments */}
                            {payment.paidAmount > 0 && (
                              <>
                                <div>
                                  <label className="text-xs font-medium text-gray-500 mb-0.5 block">
                                    Paid
                                  </label>
                                  <span className="text-xs font-semibold text-green-600">
                                    {formatCurrency(payment.paidAmount)}
                                  </span>
                                </div>
                                {payment.remainingAmount > 0 && (
                                  <div>
                                    <label className="text-xs font-medium text-gray-500 mb-0.5 block">
                                      Remaining
                                    </label>
                                    <span className="text-xs font-semibold text-orange-600">
                                      {formatCurrency(payment.remainingAmount)}
                                    </span>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          )}

          {/* Card 4: Post-Placement (if applicable) */}
          {client.clientStatus === "Placed" &&
           permissions.clients[userRole]?.postPlacementInfo?.view ? (
            <Card className="lg:col-span-1">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#682A53] rounded-full flex items-center justify-center">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle className="text-base">Post-Placement</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Total Due
                      </label>
                      <p className="text-sm font-semibold text-[#682A53]">
                        {formatCurrency(postPlacementTotalDue)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Total Paid
                      </label>
                      <p className="text-sm font-semibold text-green-600">
                        {formatCurrency(postPlacementTotalPaid)}
                      </p>
                    </div>
                  </div>
                  {client.postPlacementPlan && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Plan Name
                        </label>
                        <p className="text-sm font-medium">
                          {client.postPlacementPlan.planName}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Payment Start Date
                          </label>
                          <p className="text-sm font-medium">
                            {formatDate(
                              client.postPlacementPlan
                                .postPlacementPlanPaymentStartDate
                            )}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Total Amount
                          </label>
                          <p className="text-sm font-medium">
                            {formatCurrency(
                              client.postPlacementPlan
                                .totalPostPlacementAmount || 0
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Promissory Note */}
                  {client.promissoryNoteUrl && (
                    <div className="border-t pt-3">
                      <label className="text-sm font-medium text-gray-500">
                        Promissory Note
                      </label>
                      <a
                        href={client.promissoryNoteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        View Document
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  )}

                  {/* Post-Placement Payment Schedule */}
                  {postPlacementPayments.length > 0 && (
                    <div className="border-t pt-3">
                      <div className="mb-2">
                        <label className="text-xs font-semibold text-gray-700 mb-1 block">
                          Payment Schedule
                        </label>
                        <p className="text-xs text-gray-500">
                          {postPlacementPayments.length} payment{postPlacementPayments.length > 1 ? 's' : ''} •
                          {postPlacementPayments.filter(p => p.paymentStatus === "Paid").length} paid, {postPlacementPayments.filter(p => p.paymentStatus === "Partially_Paid").length} partial, {postPlacementPayments.filter(p => p.paymentStatus === "Pending").length} pending
                        </p>
                      </div>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50">
                              <TableHead className="text-xs font-semibold w-8">#</TableHead>
                              <TableHead className="text-xs font-semibold">Due Date</TableHead>
                              <TableHead className="text-xs font-semibold">Amount</TableHead>
                              <TableHead className="text-xs font-semibold">Paid</TableHead>
                              <TableHead className="text-xs font-semibold">Remaining</TableHead>
                              <TableHead className="text-xs font-semibold">Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {postPlacementPayments.map((payment, index) => (
                              <TableRow key={payment.paymentScheduleID} className="hover:bg-gray-50">
                                <TableCell className="text-xs font-medium">{index + 1}</TableCell>
                                <TableCell className="text-xs">{formatDate(payment.dueDate || payment.paymentDate)}</TableCell>
                                <TableCell className="text-xs font-semibold">{formatCurrency(payment.originalAmount)}</TableCell>
                                <TableCell className="text-xs font-semibold text-green-600">
                                  {payment.paidAmount > 0 ? formatCurrency(payment.paidAmount) : '-'}
                                </TableCell>
                                <TableCell className="text-xs font-semibold text-orange-600">
                                  {payment.remainingAmount > 0 ? formatCurrency(payment.remainingAmount) : '-'}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={payment.paymentStatus === "Paid" ? "default" : "secondary"}
                                    className={`text-xs ${
                                      payment.paymentStatus === "Paid"
                                        ? "bg-green-500 hover:bg-green-600 text-white"
                                        : payment.paymentStatus === "Partially_Paid"
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-orange-100 text-orange-700"
                                    }`}
                                  >
                                    {payment.paymentStatus === "Paid" ? "Paid" : payment.paymentStatus === "Partially_Paid" ? "Partial" : "Pending"}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="lg:col-span-1"></div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
