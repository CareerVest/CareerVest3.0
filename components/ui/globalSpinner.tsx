"use client";

import React from "react";
import { useLoading } from "../../contexts/loadingContext";
import Spinner from "./spinner";

const GlobalSpinner: React.FC = () => {
  const { isLoading, activeRequests } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-gray-200/50 flex flex-col items-center space-y-4 min-w-[200px]">
        <div className="relative">
          {/* Main spinner */}
          <Spinner variant="ripple" size="xl" />

          {/* Request counter badge */}
          {activeRequests > 1 && (
            <div className="absolute -top-2 -right-2 bg-[#682A53] text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
              {activeRequests}
            </div>
          )}
        </div>

        <div className="text-center">
          <p className="text-gray-700 font-medium text-lg">
            Appreciate your patience, we are loading something amazing
          </p>
          {activeRequests > 1 && (
            <p className="text-gray-500 text-sm mt-1">
              {activeRequests} requests in progress
            </p>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#682A53] to-[#8B5CF6] rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default GlobalSpinner;
