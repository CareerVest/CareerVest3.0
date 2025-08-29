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
  Loader2,
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
import type {
  ClientDetail,
  PaymentSchedule,
} from "../../types/Clients/ClientDetail";
import { useAuth } from "../../../contexts/authContext";
import permissions from "../../utils/permissions";

export default function ClientView({ params }: { params: { id: string } }) {
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { roles } = useAuth();

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
        const clientData = await getClient(Number(params.id));
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
      } finally {
        setLoading(false);
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
      (payment) => payment.paymentType === "PostPlacement"
    ) || [];

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
  const subscriptionTotalDue = subscriptionPayments.reduce(
    (sum, payment) => sum + (payment.amount || 0),
    0
  );

  const subscriptionTotalPaid = subscriptionPayments.reduce(
    (sum, payment) => sum + (payment.isPaid ? payment.amount || 0 : 0),
    0
  );

  // Calculate post-placement-specific totals
  const postPlacementTotalDue = postPlacementPayments.reduce(
    (sum, payment) => sum + (payment.amount || 0),
    0
  );

  const postPlacementTotalPaid = postPlacementPayments.reduce(
    (sum, payment) => sum + (payment.isPaid ? payment.amount || 0 : 0),
    0
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-50vh w-full">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-sm text-muted-foreground">
            Loading client...
          </span>
        </div>
      </div>
    );
  }

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
    <div className="p-6">
      {/* Modern Header */}
      <div className="mb-8">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={handleBack}
            className="bg-[#682A53] hover:bg-[#682A53]/90 text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Clients
          </Button>
          <div className="flex items-center space-x-2">
            {canEdit && (
              <Button
                onClick={() => router.push(`/clients/${client.clientID}/edit`)}
                className="bg-[#682A53] hover:bg-[#682A53]/90 text-white"
              >
                Edit Client
              </Button>
            )}
          </div>
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
                  {client.clientName}
                </h1>
                <div className="flex items-center space-x-2 mt-1">
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

      {/* Horizontal Dashboard Layout */}
      <div className="space-y-6">
        {/* Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
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
                    Assigned Sales Person
                  </label>
                  <p className="text-sm font-medium">
                    {client.assignedSalesPersonName || "N/A"}
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
                    <label className="text-sm font-medium text-gray-500 mb-2 block">
                      Payment Schedule
                    </label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {subscriptionPayments.map((payment) => (
                        <div
                          key={payment.paymentScheduleID}
                          className="flex justify-between items-center text-xs bg-gray-50 p-2 rounded"
                        >
                          <span>{formatDate(payment.paymentDate)}</span>
                          <span className="font-medium">
                            {formatCurrency(payment.amount)}
                          </span>
                          <Badge
                            variant={payment.isPaid ? "success" : "secondary"}
                            className="text-xs"
                          >
                            {payment.isPaid ? "Paid" : "Pending"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Post-Placement (if applicable) */}
          {client.clientStatus === "Placed" ? (
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
                      <label className="text-sm font-medium text-gray-500 mb-2 block">
                        Payment Schedule
                      </label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {postPlacementPayments.map((payment) => (
                          <div
                            key={payment.paymentScheduleID}
                            className="flex justify-between items-center text-xs bg-gray-50 p-2 rounded"
                          >
                            <span>{formatDate(payment.paymentDate)}</span>
                            <span className="font-medium">
                              {formatCurrency(payment.amount)}
                            </span>
                            <Badge
                              variant={payment.isPaid ? "success" : "secondary"}
                              className="text-xs"
                            >
                              {payment.isPaid ? "Paid" : "Pending"}
                            </Badge>
                          </div>
                        ))}
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
  );
}
