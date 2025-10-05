"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import Image from "next/image";

export default function ResumeConfirmationPreviewPage() {
  const [previewState, setPreviewState] = useState<"email" | "loading" | "success" | "error">("email");

  const message =
    previewState === "success"
      ? "Resume draft confirmed successfully!"
      : "Failed to confirm resume. The link may have expired or is invalid.";

  return (
    <div className="min-h-screen flex overflow-auto">
      {/* Left Side - Maroon with Company Info (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#682A53] to-[#8B3A6F] relative overflow-y-auto">
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

          {/* Resume Process Steps */}
          <div className="space-y-8 my-auto">
            <div className="flex items-center space-x-4 animate-slide-right" style={{ animationDelay: '0.2s' }}>
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-[#FDC500]" />
              </div>
              <div className="text-white">
                <h3 className="font-semibold text-lg">Resume Completed</h3>
                <p className="text-white/70 text-sm">Your professional resume is ready</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 animate-slide-right" style={{ animationDelay: '0.4s' }}>
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <svg className="w-8 h-8 text-[#FDC500]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div className="text-white">
                <h3 className="font-semibold text-lg">Confirm Your Resume</h3>
                <p className="text-white/70 text-sm">Review and approve to proceed</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 animate-slide-right" style={{ animationDelay: '0.6s' }}>
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <svg className="w-8 h-8 text-[#FDC500]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="text-white">
                <h3 className="font-semibold text-lg">Marketing Stage</h3>
                <p className="text-white/70 text-sm">We'll market you to employers</p>
              </div>
            </div>
          </div>

          {/* Stats/Success Metrics */}
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

      {/* Right Side - White with Confirmation Card */}
      <div className="w-full lg:w-1/2 bg-gradient-to-br from-white to-gray-50 flex items-center justify-center p-4 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-2xl animate-fade-in">
          <div className="bg-white shadow-2xl rounded-2xl border-0 p-6 lg:p-8">
            {/* Status Display */}
            <div className="text-center">
              {previewState === "email" && (
                <div className="space-y-6">
                  {/* Logo and Branding - Show on mobile only */}
                  <div className="text-center mb-6 lg:hidden">
                    <div className="inline-flex items-center justify-center mb-3">
                      <Image
                        src="/logo profile only.png"
                        alt="CareerVest Logo"
                        width={60}
                        height={60}
                        className="object-contain"
                      />
                    </div>
                    <h1 className="text-3xl font-bold text-[#682A53]">CareerVest</h1>
                  </div>

                  <div>
                    <p className="text-gray-700 mb-3">Hi John Doe,</p>
                    <div className="text-left space-y-3">
                      <p className="text-gray-700 text-sm">
                        Great news! Your resume draft has been completed and is ready for your review.
                      </p>
                      <p className="text-gray-700 text-sm">
                        I've attached the draft resume to this email. Please take a moment to review it carefully and let us know if you have any questions or need any changes.
                      </p>

                      <div className="bg-purple-50 border border-[#682A53]/20 rounded-xl p-4 my-4">
                        <p className="font-semibold text-[#682A53] mb-2">Next Step - Confirm Your Resume</p>
                        <p className="text-gray-700 text-xs mb-4">
                          If you're happy with the resume and ready to proceed to the marketing stage, please click the button below to confirm:
                        </p>
                        <div className="text-center my-3">
                          <button
                            onClick={() => setPreviewState("loading")}
                            className="bg-[#FDC500] hover:bg-[#682A53] text-[#682A53] hover:text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center gap-2"
                          >
                            <CheckCircle className="w-5 h-5" />
                            Confirm Resume Draft
                          </button>
                        </div>
                        <p className="text-gray-600 text-xs mt-3">
                          <strong>Important:</strong> This confirmation link will expire in 7 days. If you need any changes to your resume, please reply to this email before confirming.
                        </p>
                      </div>

                      <p className="text-gray-700 text-xs">
                        <strong>Note:</strong> We cannot proceed to the marketing stage until you confirm the resume draft.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {previewState === "loading" && (
                <div className="space-y-6">
                  {/* Logo and Branding - Show on mobile only */}
                  <div className="text-center mb-6 lg:hidden">
                    <div className="inline-flex items-center justify-center mb-3">
                      <Image
                        src="/logo profile only.png"
                        alt="CareerVest Logo"
                        width={60}
                        height={60}
                        className="object-contain"
                      />
                    </div>
                    <h1 className="text-3xl font-bold text-[#682A53]">CareerVest</h1>
                  </div>

                  <div className="flex justify-center mb-4">
                    <Loader2 className="w-12 h-12 text-[#682A53] animate-spin" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-base">Please wait while we process your confirmation...</p>
                  </div>
                </div>
              )}

              {previewState === "success" && (
                <div className="space-y-4">
                  {/* Logo and Branding - Show on mobile only */}
                  <div className="text-center mb-4 lg:hidden">
                    <div className="inline-flex items-center justify-center mb-3">
                      <Image
                        src="/logo profile only.png"
                        alt="CareerVest Logo"
                        width={60}
                        height={60}
                        className="object-contain"
                      />
                    </div>
                    <h1 className="text-3xl font-bold text-[#682A53]">CareerVest</h1>
                  </div>

                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <div className="w-20 h-20 bg-[#FDC500]/20 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-12 h-12 text-[#FDC500]" strokeWidth={3} />
                      </div>
                      <div className="absolute inset-0 animate-ping">
                        <div className="w-20 h-20 bg-[#FDC500]/20 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-12 h-12 text-[#FDC500] opacity-30" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#682A53] mb-3">Confirmation Successful!</h2>
                    <p className="text-gray-700 mb-4">{message}</p>
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-800">
                      <p className="font-semibold mb-2">What happens next?</p>
                      <ul className="text-left text-sm space-y-1.5 ml-5 list-disc">
                        <li>Your resume has been marked as confirmed</li>
                        <li>Our team will proceed with the next steps</li>
                        <li>You will receive updates via email</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {previewState === "error" && (
                <div className="space-y-4">
                  {/* Logo and Branding - Show on mobile only */}
                  <div className="text-center mb-4 lg:hidden">
                    <div className="inline-flex items-center justify-center mb-3">
                      <Image
                        src="/logo profile only.png"
                        alt="CareerVest Logo"
                        width={60}
                        height={60}
                        className="object-contain"
                      />
                    </div>
                    <h1 className="text-3xl font-bold text-[#682A53]">CareerVest</h1>
                  </div>

                  <div className="flex justify-center mb-4">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
                      <XCircle className="w-12 h-12 text-red-500" strokeWidth={3} />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#682A53] mb-3">Confirmation Failed</h2>
                    <p className="text-gray-700 mb-4">{message}</p>
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800">
                      <p className="font-semibold mb-2">Need help?</p>
                      <p className="text-left text-sm">
                        Please contact your Resume Department representative or email{" "}
                        <a href="mailto:resume@careervest.ai" className="font-semibold underline hover:text-red-900">
                          resume@careervest.ai
                        </a>{" "}
                        if you continue to experience issues.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Preview Controls */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="text-xs font-semibold text-yellow-900 mb-3">Preview Mode - Toggle States:</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPreviewState("email")}
                  className={`px-3 py-2 text-xs rounded-lg font-medium transition-all ${
                    previewState === "email"
                      ? "bg-[#682A53] text-white"
                      : "bg-white text-gray-700 border border-gray-300 hover:border-[#682A53]"
                  }`}
                >
                  Email View
                </button>
                <button
                  onClick={() => setPreviewState("loading")}
                  className={`px-3 py-2 text-xs rounded-lg font-medium transition-all ${
                    previewState === "loading"
                      ? "bg-[#682A53] text-white"
                      : "bg-white text-gray-700 border border-gray-300 hover:border-[#682A53]"
                  }`}
                >
                  Loading
                </button>
                <button
                  onClick={() => setPreviewState("success")}
                  className={`px-3 py-2 text-xs rounded-lg font-medium transition-all ${
                    previewState === "success"
                      ? "bg-green-600 text-white"
                      : "bg-white text-gray-700 border border-gray-300 hover:border-green-600"
                  }`}
                >
                  Success
                </button>
                <button
                  onClick={() => setPreviewState("error")}
                  className={`px-3 py-2 text-xs rounded-lg font-medium transition-all ${
                    previewState === "error"
                      ? "bg-red-600 text-white"
                      : "bg-white text-gray-700 border border-gray-300 hover:border-red-600"
                  }`}
                >
                  Error
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
