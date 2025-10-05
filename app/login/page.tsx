"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { useAuth } from "../../contexts/authContext";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { login, isAuthenticated, isInitialized } = useAuth();

  useEffect(() => {
    // Only redirect if Microsoft authentication is successful
    if (isInitialized && isAuthenticated) {
      console.log(
        "✅ Microsoft authentication successful, redirecting to dashboard"
      );
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isInitialized, router]);

  const handleMicrosoftLogin = async () => {
    if (!isInitialized) {
      setError("Authentication is still initializing...");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const success = await login();
      if (!success) {
        setError("Login failed or was canceled.");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
      console.error("🔸 Login Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-sm text-muted-foreground">Initializing...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Left Side - Maroon with Career Icons */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#682A53] to-[#8B3A6F] relative overflow-hidden">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo and Title */}
          <div className="space-y-4">
            <div className="w-32 h-32 flex items-center justify-center animate-fade-in">
              <Image
                src="/logo profile only.png"
                alt="CareerVest Logo"
                width={128}
                height={128}
                className="w-full h-full object-contain drop-shadow-2xl"
              />
            </div>
            <h1 className="text-5xl font-bold text-white animate-slide-in">
              CareerVest
            </h1>
            <p className="text-2xl text-white/90 font-light animate-slide-in-delay">
              Elevate Your Career Journey
            </p>
          </div>

          {/* Animated Career Icons */}
          <div className="space-y-8 my-auto">
            {/* Icon 1 - Resume */}
            <div className="flex items-center space-x-4 animate-slide-right" style={{ animationDelay: '0.2s' }}>
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <svg className="w-8 h-8 text-[#FDC500]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="text-white">
                <h3 className="font-semibold text-lg">Professional Resume</h3>
                <p className="text-white/70 text-sm">Expertly crafted resumes</p>
              </div>
            </div>

            {/* Icon 2 - Interview */}
            <div className="flex items-center space-x-4 animate-slide-right" style={{ animationDelay: '0.4s' }}>
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <svg className="w-8 h-8 text-[#FDC500]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="text-white">
                <h3 className="font-semibold text-lg">Interview Chains</h3>
                <p className="text-white/70 text-sm">Track your interview progress</p>
              </div>
            </div>

            {/* Icon 3 - Career Growth */}
            <div className="flex items-center space-x-4 animate-slide-right" style={{ animationDelay: '0.6s' }}>
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <svg className="w-8 h-8 text-[#FDC500]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="text-white">
                <h3 className="font-semibold text-lg">Career Growth</h3>
                <p className="text-white/70 text-sm">Accelerate your success</p>
              </div>
            </div>

            {/* Icon 4 - Success */}
            <div className="flex items-center space-x-4 animate-slide-right" style={{ animationDelay: '0.8s' }}>
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <svg className="w-8 h-8 text-[#FDC500]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div className="text-white">
                <h3 className="font-semibold text-lg">Placement Success</h3>
                <p className="text-white/70 text-sm">Land your dream job</p>
              </div>
            </div>
          </div>

          {/* Stats/Benefits */}
          <div className="grid grid-cols-3 gap-4 animate-fade-in-up">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#FDC500]">1000+</div>
              <div className="text-white/70 text-sm">Clients Placed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#FDC500]">95%</div>
              <div className="text-white/70 text-sm">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#FDC500]">24/7</div>
              <div className="text-white/70 text-sm">Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - White with Login Card */}
      <div className="w-full lg:w-1/2 bg-gradient-to-br from-white to-gray-50 flex items-center justify-center p-4 lg:p-12">
        <div className="w-full max-w-md animate-fade-in">
          <Card className="shadow-2xl border-0">
            <CardHeader className="text-center pt-8 pb-6 space-y-4">
              {/* Logo for mobile */}
              <div className="lg:hidden mx-auto w-24 h-24 flex items-center justify-center mb-4">
                <Image
                  src="/logo profile only.png"
                  alt="CareerVest Logo"
                  width={96}
                  height={96}
                  className="w-full h-full object-contain drop-shadow-xl"
                />
              </div>
              <CardTitle className="text-3xl font-bold text-[#682A53]">
                Sign in to CareerVest
              </CardTitle>
              <CardDescription className="text-gray-600 text-base">
                Use your Microsoft account to continue
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-8 pb-8">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Microsoft Login Button */}
              <Button
                onClick={handleMicrosoftLogin}
                disabled={isLoading}
                className="w-full bg-[#682A53] hover:bg-[#FFD700] hover:text-black font-semibold text-lg py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <svg className="mr-3 h-5 w-5" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                      <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
                      <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                      <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
                    </svg>
                    Sign in with Microsoft
                  </>
                )}
              </Button>

              {/* Benefits for mobile */}
              <div className="lg:hidden pt-6 space-y-3">
                <p className="text-center text-gray-500 text-sm font-medium">Why CareerVest?</p>
                <div className="flex justify-around text-center">
                  <div>
                    <div className="text-xl font-bold text-[#682A53]">1000+</div>
                    <div className="text-xs text-gray-500">Placements</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-[#682A53]">95%</div>
                    <div className="text-xs text-gray-500">Success</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-[#682A53]">24/7</div>
                    <div className="text-xs text-gray-500">Support</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional info */}
          <p className="text-center text-gray-500 text-sm mt-6">
            Secure authentication powered by Microsoft
          </p>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slide-in-delay {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slide-right {
          from {
            opacity: 0;
            transform: translateX(-40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .animate-slide-in {
          animation: slide-in 0.8s ease-out;
        }

        .animate-slide-in-delay {
          animation: slide-in-delay 1s ease-out;
        }

        .animate-slide-right {
          animation: slide-right 0.8s ease-out;
          animation-fill-mode: both;
        }

        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out 1s;
          animation-fill-mode: both;
        }
      `}</style>
    </div>
  );
}
