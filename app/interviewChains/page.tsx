"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/authContext";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "../../components/ui/alert";
import Spinner from "../../components/ui/spinner";
import InterviewChainManager from "./components/interviewChainManager";

export default function InterviewChainPage() {
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const { user, isAuthenticated, isInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // Temporarily disabled permission check for testing
    // if (!(user as any)?.roles?.some((role: string) =>
    //   ["Admin", "Sales_Executive", "Senior_Recruiter", "Recruiter", "Marketing_Manager"].includes(role)
    // )) {
    //   router.push("/"); // Redirect to dashboard if no permission
    // }
  }, [isAuthenticated, isInitialized, router, user]);

  if (!isInitialized || !isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-[50vh] w-full">
        <Spinner />
      </div>
    );
  }

  // Temporarily disabled permission check for testing
  // if (!(user as any)?.roles?.some((role: string) =>
  //   ["Admin", "Sales_Executive", "Senior_Recruiter", "Recruiter", "Marketing_Manager"].includes(role)
  // )) {
  //   return (
  //     <div className="flex justify-center items-center h-[50vh] w-full">
  //       <Alert className="max-w-md">
  //         <AlertDescription>
  //           You do not have permission to view interview chains. Please contact an administrator.
  //         </AlertDescription>
  //       </Alert>
  //     </div>
  //   );
  // }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-[#682A53]">
          Interview Chains
        </h1>
      </div>

      <InterviewChainManager
        openAddDialog={openAddDialog}
        setOpenAddDialog={setOpenAddDialog}
      />
    </div>
  );
}
