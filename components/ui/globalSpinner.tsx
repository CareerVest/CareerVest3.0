"use client";

import React from "react";
import { useLoading } from "../../contexts/loadingContext";
import Spinner from "./spinner";

const GlobalSpinner: React.FC = () => {
  const { isLoading, activeRequests } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
      {/* Option 2: Clean White Card with Brand Accents - Maroon Logo Container */}
      <div className="bg-white rounded-2xl p-6 shadow-2xl border-t-4 border-[#682A53] flex flex-col items-center space-y-4 min-w-[280px]">
        {/* CareerVest Logo with rotating ring */}
        <div className="relative w-24 h-24">
          {/* Rotating yellow ring */}
          <div className="absolute inset-0 border-4 border-transparent border-t-[#FDC500] border-r-[#FDC500] rounded-full animate-spin" />
          <div className="absolute inset-2 border-4 border-transparent border-b-[#682A53] border-l-[#682A53] rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />

          {/* Maroon background circle for logo */}
          <div className="absolute inset-4 bg-gradient-to-br from-[#682A53] to-[#8B3A6F] rounded-full shadow-lg flex items-center justify-center">
            {/* Logo in center */}
            <div className="w-12 h-12 flex items-center justify-center">
              <Spinner variant="ripple" size="md" />
            </div>
          </div>
        </div>

        <div className="text-center space-y-2">
          <p className="text-gray-600 text-sm">
            Appreciate your patience, we are loading something amazing
          </p>
        </div>

        {/* Animated dots */}
        <div className="flex space-x-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-[#FDC500] rounded-full animate-bounce"
              style={{
                animationDelay: `${i * 0.15}s`,
                animationDuration: '0.6s',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GlobalSpinner;
