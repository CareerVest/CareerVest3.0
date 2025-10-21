"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";

interface ConfirmationResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

export default function ConfirmResumePage() {
  const params = useParams();
  const token = params.token as string;

  const [status, setStatus] = useState<
    "loading" | "success" | "error" | "expired"
  >("loading");
  const [message, setMessage] = useState("");
  const [timestamp, setTimestamp] = useState("");

  useEffect(() => {
    if (token) {
      confirmResume();
    }
  }, [token]);

  const confirmResume = async () => {
    try {
      const response = await fetch(
        `/api/resume-confirmation/confirm/${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data: ConfirmationResponse = await response.json();

      if (data.success) {
        setStatus("success");
        setMessage(data.message);
        setTimestamp(data.timestamp);
      } else {
        if (data.message.includes("expired")) {
          setStatus("expired");
        } else {
          setStatus("error");
        }
        setMessage(data.message);
        setTimestamp(data.timestamp);
      }
    } catch (error) {
      setStatus("error");
      setMessage("An error occurred while processing your confirmation.");
      setTimestamp(new Date().toISOString());
    }
  };

  const renderStatusIcon = () => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case "error":
        return <XCircle className="h-16 w-16 text-red-500" />;
      case "expired":
        return <Clock className="h-16 w-16 text-yellow-500" />;
      default:
        return <AlertCircle className="h-16 w-16 text-blue-500 animate-spin" />;
    }
  };

  const renderStatusTitle = () => {
    switch (status) {
      case "success":
        return "Resume Draft Confirmed!";
      case "error":
        return "Confirmation Failed";
      case "expired":
        return "Confirmation Link Expired";
      default:
        return "Processing Confirmation...";
    }
  };

  const renderStatusDescription = () => {
    switch (status) {
      case "success":
        return "Thank you for confirming your resume draft. Our resume team has been notified and will proceed with uploading the required documents.";
      case "error":
        return "We encountered an issue processing your confirmation. Please contact our support team for assistance.";
      case "expired":
        return "This confirmation link has expired. Please contact our resume team to request a new confirmation link.";
      default:
        return "Please wait while we process your confirmation...";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">{renderStatusIcon()}</div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            {renderStatusTitle()}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {renderStatusDescription()}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {status === "success" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Confirmed at: {new Date(timestamp).toLocaleString()}
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">
                  Your resume draft has been successfully confirmed. Our team
                  will now proceed with the next steps.
                </p>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Error occurred at: {new Date(timestamp).toLocaleString()}
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">
                  Please contact our support team at support@careervest.ai for
                  assistance.
                </p>
              </div>
            </div>
          )}

          {status === "expired" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Link expired at: {new Date(timestamp).toLocaleString()}
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  Please contact our resume team to request a new confirmation
                  link.
                </p>
              </div>
            </div>
          )}

          <div className="mt-6">
            <Button
              onClick={() => window.close()}
              variant="outline"
              className="w-full"
            >
              Close Window
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
